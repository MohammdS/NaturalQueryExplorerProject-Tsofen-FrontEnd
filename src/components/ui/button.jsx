import * as React from "react";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const getButtonClasses = () => {
    let classes = "btn transition-smooth";
    
    if (variant === "default") classes += " btn-default";
    else if (variant === "destructive") classes += " btn-outline text-destructive hover:bg-red-50";
    else if (variant === "outline") classes += " btn-outline";
    else if (variant === "secondary") classes += " btn-outline bg-gray-100 hover:bg-gray-200";
    else if (variant === "ghost") classes += " btn-outline border-0 bg-transparent hover:bg-gray-100";
    else if (variant === "link") classes += " btn-outline border-0 bg-transparent text-blue-600 hover:underline";
    
    if (size === "sm") classes += " btn-sm";
    else if (size === "lg") classes += " btn-lg";
    
    return classes;
  };
  
  return (
    <button
      className={`${getButtonClasses()} ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
