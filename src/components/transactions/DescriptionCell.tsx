import React, { useState } from "react";

const DescriptionCell: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 50; // Maximum characters to show initially

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <div>
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default DescriptionCell;
