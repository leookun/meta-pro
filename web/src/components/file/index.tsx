/* eslint-disable simple-import-sort/imports */
import "./editor.scss"

import Button from 'src/components/Button';
import { useMutation,useQuery} from '@tanstack/react-query';
import { highlight, languages } from 'prismjs/components/prism-core';
import React, { useState, useEffect,useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from 'react-simple-code-editor';
import { useApiConfig } from 'src/store/app';

import { ContentHeader } from '../ContentHeader';
import s0 from './file.module.scss';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css'; //Example style, you can use another

export default function File() {
  const { baseURL, secret } = useApiConfig();
  const [config, setConfig] = useState('');
  const { t } = useTranslation();
  const { data } = useQuery(['/config.yaml'], ctx => {
    return fetch(`${baseURL}/config.yaml`,{
      headers: {
        'Authorization': `Bearer ${secret}`,
      },
    }).then(res => res.text())
  });

  useEffect(() => {
    setConfig(data);
  }, [data]);

  const updateConfig = useMutation({
    mutationFn: (data: string) => {
      return fetch(`${baseURL}/config.yaml`, {
        method: 'PUT',
        body: data,
        headers: {
          'Authorization': `Bearer ${secret}`,
        },
      })
    },
  });
  const restartServer = useMutation({
    mutationFn: () => {
      return fetch(`${baseURL}/restart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });
    },
  });
  
  const onValueChange = (value: string) => {
    setConfig(value);
  }
  const saveAndRestart = async () => {
    await updateConfig.mutate(config);
    await restartServer.mutate();
    window.location.reload();
  };

  const loading=useMemo(()=>{
    return updateConfig.isLoading || restartServer.isLoading
  },[updateConfig.isLoading,restartServer.isLoading])
  return (
    <div>
      <ContentHeader title={t('配置文件')} />
      <div className={s0.root}>
        <div className="flex gap-2 mb-4">
          <button
            isLoading={loading}
            onClick={() => saveAndRestart()}
            className="!px-4 !py-[5px] !text-[14px] !rounded-md bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
          >
            保存并重启
          </button>
        </div>
        <Editor
          className="w-full h-full"
          value={config}
          highlight={(code) => highlight(code, languages.yaml)}
          padding={10}
          onValueChange={onValueChange}
          style={{
            fontFamily: 'system-ui',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        />
      </div>
    </div>
  );
}
