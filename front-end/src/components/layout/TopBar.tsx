import { MapPin, Phone, AtSign, Star } from "lucide-react";

export default function TopBar() {
  return (
    <div className="w-full bg-primary py-2">
      <div className="container mx-auto px-20 flex items-center justify-between text-primary-foreground text-xs font-body">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">Jakarta, Indonesia</span>
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">+62 812-xxxx-xxxx</span>
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <span className="flex items-center gap-1">
            <AtSign className="w-3 h-3" />
            @wmg.official
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-accent text-accent" />
            4.9/5
          </span>
        </div>
      </div>
    </div>
  );
}
