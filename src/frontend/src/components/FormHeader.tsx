interface FormHeaderProps {
  title: string;
}

const FormHeader = ({ title }: FormHeaderProps) => {
  return (
    <h1 className="mb-6 text-center text-2xl font-semibold text-orange-700">
      {title}
    </h1>
  );
};

export default FormHeader;
