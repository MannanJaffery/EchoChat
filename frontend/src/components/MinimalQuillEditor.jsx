//not in use for now 

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [['bold', 'italic', 'underline']],
};

const formats = ['bold', 'italic', 'underline'];

function MinimalQuillEditor({ value, onChange, placeholder = "Write something..." }) {
  return (
    <ReactQuill
      theme="snow"
      spellCheck={false}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
  );
}

export default MinimalQuillEditor;
