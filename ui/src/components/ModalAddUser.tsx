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
    resource: "users",
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
        message: "Nouvel utilisateur créé"
      }
    },
  });

  const [loading, setLoading] = useState(false);
    

    const { selectProps: servicesSelectProps } = useSelect({
      resource: "services",
      queryOptions: {
          // enabled: !!blogPostsData?.category?.id,
      },
      optionLabel: 'name',
      optionValue: 'id'
  });

  const handleSubmit = async () => {
      const rawToken = localStorage.getItem(TOKEN_KEY);
      const parsedAuth = JSON.parse(rawToken)
      const token = parsedAuth.token
      console.log("token ", token)
  
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
        // onOk={handleSubmit}
        {...createModalProps}
        onCancel={handleCancel}
        open={open}
          title="Nouvel utilisateur"
        >
        <Spin spinning={createFormLoading}>
          <Form  
          {...createFormProps}
          layout="vertical">
              <Form.Item
                  label={"Nom et prénoms"}
                  name={["fullname"]}
                  rules={[
                      {
                          required: true,
                      },
                  ]}
              >
                  <Input />
              </Form.Item>
              <Form.Item
                  label={"Email"}
                  name={["username"]}
                  rules={[
                      {
                          type: "email",
                          required: true
                      },
                  ]}
              >
                  <Input />
              </Form.Item>
              <Form.Item
                  label={"Mot de passe"}
                  name={["password"]}
                  rules={[
                      {
                          required: true
                      },
                  ]}
              >
                  <Input />
              </Form.Item>

              <Form.Item
                  label={"Nommer administrateur ?"}
                  name={["is_admin"]}
                  rules={[
                      {
                          type: "boolean",
                      },
                  ]}
              >
                  <Switch />
              </Form.Item>

                      <Form.Item
                          label={"Service"}
                          name={'id_service'}
                      >
                          <Select
                              style={{ width: '100%' }}
                              placeholder="Sélectionnez"
                              {...servicesSelectProps}
                              // defaultValue={['china']}
                              // // onChange={handleChange}
                              // options={usersSelectProps.options}
                              // optionRender={(option) => (
                              // <Space>
                              //     <span role="img" aria-label={option.data.label}>
                              //     {option.data.emoji}
                              //     </span>
                              //     {option.data.desc}
                              // </Space>
                              // )}
                          />
                      </Form.Item>
          </Form>
        </Spin>

      </Modal>
    );
  }
  