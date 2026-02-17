
import React from "react";
import InputToRender from "./input-to-render";

const FormField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  as = "input",
  options = [],
}: FormFieldProps) => {


  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <InputToRender type={as} id={id} value={value} placeholder={placeholder} onChange={onChange} options={options} label={label}/>
    </div>
  );
};

export default FormField;
