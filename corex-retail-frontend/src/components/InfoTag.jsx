import React from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const InfoTag = ({ text, tooltipText, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gray-700 font-medium">{text}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded-md shadow-lg text-sm">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

InfoTag.propTypes = {
  text: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
  className: PropTypes.string,
};

InfoTag.defaultProps = {
  className: '',
};

export default InfoTag;
