import React, { useEffect, useState } from "react";
import axios from "axios";
import { TOKEN_KEY } from "../authProvider";
import { Button, Modal } from "antd";


export default function({ open, handleCancel, handleSuccess, basePath }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleOk = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        handleCancel(false);
      }, 3000);
    };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleUpload = async () => {
      if (!file) return;
      if(!basePath) {
        alert("basePath required")
        return
      }
      const rawToken = localStorage.getItem(TOKEN_KEY);
      const parsedAuth = JSON.parse(rawToken)
      const token = parsedAuth.token
      console.log("token ", token)
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('basePath', basePath);
  
      try {
          await axios.post(
            import.meta.env.VITE_API_URL + "/upload",
            formData,
            {
              headers: {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          alert("Opération réussie");
          setFile(null)
          handleSuccess()
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Failed to upload file");
        }  finally {
          setLoading(false)
        }   
    };
  
    return (
        <Modal
        open={open}
        title="Sélectionner un fichier"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Retour
          </Button>,
          <>
            {
              file && <Button key="submit" className="bg-green-600" type="primary" loading={loading} onClick={handleUpload}>
              Téléverser
            </Button>
            }
          </>,
        ]}
      >
        <input type="file" onChange={handleFileChange} />

      </Modal>
    );
  }
  