import React, { useEffect, useState } from "react";
import axios from "axios";
import { TOKEN_KEY } from "../authProvider";
import { Button, Form, Input, Modal, Select, Spin, Switch } from "antd";
import { Create, useForm, useModalForm, useSelect } from "@refinedev/antd";


export default function({ open, handleCancel, handleSuccess }) {
  // const { formProps, saveButtonProps, queryResult, formLoading, onFinish } = useForm({});
  // Create Modal
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    formLoading: createFormLoading,
  } = useModalForm({
    action: "create",
    resource: "services",
    syncWithLocation: true,
    redirect: false,
    errorNotification(error, values, resource) {
      console.log("error?.response ", error?.response?.data)
      console.log("error?.response 2 ", error)
      
      return {
        type: 'error',
        message: "Une erreur s'est produite"
      }
    },
    successNotification (data, values, resource) {
      setTimeout(() => {
        handleCancel()
        handleSuccess()
      }, 1000);
      return {
        type: 'success',
        message: "Nouveau service créé"
      }
    },
  });

  const [loading, setLoading] = useState(false);
      
    return (
        <Modal
        {...createModalProps}
        onCancel={handleCancel}
        open={open}
          title="Nouveau service"
        >
        <Spin spinning={createFormLoading}>
          <Form  
          {...createFormProps}
          layout="vertical">
              <Form.Item
                  label={"Nom du service"}
                  name={["name"]}
                  rules={[
                      {
                          required: true,
                      },
                  ]}
              >
                  <Input />
              </Form.Item>
              <Form.Item
                  label={"Dossier"}
                  name={["folder"]}
                  rules={[
                      {
                          required: true
                      },
                  ]}
              >
                  <Input placeholder="Chemin absolu depuis la racine du disque (ex: /home/maxtor/marketing-service)" />
              </Form.Item>
          </Form>
        </Spin>

      </Modal>
    );
  }
  