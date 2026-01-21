"use client";
import { useState, useEffect, useRef } from "react";

interface CustomDropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
}

const CustomDropdown = ({
  options,
  onSelect,
  placeholder = "Sélectionnez une option",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle option selection
  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={"dropdown"} ref={dropdownRef}>
      <div className={"selectBox"} onClick={() => setIsOpen(!isOpen)}>
        <span>{selected || placeholder}</span>
        <span className={"arrow"}>&#9662;</span>
      </div>
      {isOpen && (
        <ul className={"optionsList"}>
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
