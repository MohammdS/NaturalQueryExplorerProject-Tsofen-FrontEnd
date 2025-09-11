import * as React from "react";

function Badge({ className, variant = "default", ...props }) {
  const getBadgeClasses = () => {
    let classes = "badge transition-smooth";
    
    if (variant === "default") classes += " badge-default";
    else if (variant === "secondary") classes += " badge-secondary";
    else if (variant === "destructive") classes += " badge-outline text-destructive border-red-300";
    else if (variant === "outline") classes += " badge-outline";
    
    return classes;
  };
  
  return (
    <div 
      className={`${getBadgeClasses()} ${className || ''}`}
      {...props} 
    />
  );
}

export { Badge };
