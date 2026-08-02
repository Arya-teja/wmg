import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt.guards';
import {ReviewsService} from './reviews.service';
import {CreateReviewDto} from './dto/create-review.dto';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  //Create a review for a product
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() dto: CreateReviewDto) {
        return this.reviewsService.createReview(req.user.userId, dto);
    }

    //Get all reviews for a product
    @Get('product/:productId')
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(productId);
    }

    //Delete a review
    @UseGuards(JwtAuthGuard)
    @Delete(':reviewId')
    remove(@Req() req, @Param('reviewId') reviewId: string) {
        return this.reviewsService.removeReview(req.user.userId, reviewId);
    }
}
