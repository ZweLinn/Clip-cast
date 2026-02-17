const InputToRender = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  options = [],
}: FormFieldProps) => {
  if (type === "textarea") {
    return (
      <textarea
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  } else if (type === "select") {
    return (
      <select id={id} name={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    return (
      <input
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  }
};
export default InputToRender;
