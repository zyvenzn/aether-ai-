"use client";

import React from "react";
import Badge from "./Badge";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  badge: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  description,
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 relative z-10">
      <Badge pulse variant="primary" className="mb-4">
        {Icon && <Icon className="h-3.5 w-3.5 mr-1 inline-block" />}
        {badge}
      </Badge>
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
        {title}
      </h2>
      <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default SectionHeader;
