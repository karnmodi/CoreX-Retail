import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {Button} from "@/components/ui/button";


const EmployeeSection = ({ title, show, toggle, children }) => {
  return (
    <>
      <Button
        className="w-full flex items-center justify-between px-4 py-2 text-black bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md transition-all duration-200"
        onClick={toggle} 
        
      >
        {title} {show ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {show && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">{children}</div>}
    </>
  );
};

export default EmployeeSection;
