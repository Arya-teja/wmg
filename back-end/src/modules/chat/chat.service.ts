import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly ai: GoogleGenAI;
  private readonly model = 'gemini-3.5-flash-lite';

  constructor(private readonly prisma: PrismaService) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  private readonly systemInstruction = `
Kamu adalah asisten belanja untuk WMG (Where's My Grandma), toko streetwear bertema batik Nusantara.
Tugas kamu: membantu pelanggan menentukan ukuran baju berdasarkan tinggi & berat badan, dan mengecek stok produk.
Selalu jawab dalam Bahasa Indonesia, dengan nada ramah, santai, dan natural seperti staf toko - jangan kaku atau terasa seperti template.
Jangan mengarang data stok atau ukuran - selalu gunakan function yang tersedia untuk mengambil data yang akurat.
`;

  private readonly recommendSizeFunction = {
    name: 'recommendSize',
    description:
      'Menghitung rekomendasi ukuran baju (S/M/L/XL) berdasarkan tinggi dan berat badan pengguna',
    parameters: {
      type: Type.OBJECT,
      properties: {
        heightCm: { type: Type.NUMBER, description: 'Tinggi badan dalam cm' },
        weightKg: { type: Type.NUMBER, description: 'Berat badan dalam kg' },
      },
      required: ['heightCm', 'weightKg'],
    },
  };

  private readonly checkProductStockFunction = {
    name: 'checkProductStock',
    description:
      'Mengecek stok dan ukuran yang tersedia untuk sebuah produk berdasarkan nama produk yang disebut pengguna',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productName: {
          type: Type.STRING,
          description:
            'Nama produk yang ditanyakan pengguna, boleh tidak lengkap/sebagian',
        },
      },
      required: ['productName'],
    },
  };

  private recommendSize(heightCm: number, weightKg: number) {
    // Logic sederhana berbasis tinggi & berat, bisa disesuaikan lagi nanti
    const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

    let size: string;
    if (heightCm < 160 || bmi < 18) size = 'S';
    else if (heightCm < 175 || bmi < 23) size = 'M';
    else if (heightCm < 185 || bmi < 27) size = 'L';
    else size = 'XL';

    return { recommendedSize: size };
  }

  private async checkProductStock(productName: string) {
    const product = await this.prisma.product.findFirst({
      where: { name: { contains: productName, mode: 'insensitive' } },
    });

    if (!product) {
      const allProducts = await this.prisma.product.findMany({
        select: { name: true },
        take: 5,
      });
      return {
        found: false,
        suggestions: allProducts.map((p) => p.name),
      };
    }

    return {
      found: true,
      productName: product.name,
      stock: product.stock,
      availableSizes: product.sizes,
    };
  }

  async sendMessage(
    message: string,
    history: { role: 'user' | 'model'; content: string }[],
  ) {
    const contents: any[] = [
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    let response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: this.systemInstruction,

        tools: [
          {
            functionDeclarations: [
              this.recommendSizeFunction,
              this.checkProductStockFunction,
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      let result: any;

      if (call.name === 'recommendSize') {
        result = this.recommendSize(
          call.args!.heightCm as number,
          call.args!.weightKg as number,
        );
      } else if (call.name === 'checkProductStock') {
        result = await this.checkProductStock(call.args!.productName as string);
      }

      contents.push(response.candidates![0].content!);
      contents.push({
        role: 'user',
        parts: [
          { functionResponse: { name: call.name, response: result } } as any,
        ],
      });

      response = await this.ai.models.generateContent({
        model: this.model,
        contents,
        config: { systemInstruction: this.systemInstruction },
      });
    }

    return { reply: response.text };
  }
}
