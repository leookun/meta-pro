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
  const { baseURL } = useApiConfig();
  const [config, setConfig] = useState('');
  const { t } = useTranslation();
  const { data } = useQuery(['/config.yaml'], ctx => {
    return fetch(`${baseURL}/config.yaml`).then(res => res.text())
  });

  useEffect(() => {
    setConfig(data);
  }, [data]);

  const updateConfig = useMutation({
    mutationFn: (data: string) => {
      return fetch(`${baseURL}/config.yaml`, {
        method: 'PUT',
        body: data,
      })
    },
  });
  const restartServer = useMutation({
    mutationFn: () => {
      return fetch(`${baseURL}/restart`, {
        method: 'POST',
      })
    },
  });
  
  const onValueChange = (value: string) => {
    setConfig(value);
  }
  const saveAndRestart = async () => {
    await updateConfig.mutate(config);
    await restartServer.mutate();
  };

  const loading=useMemo(()=>{
    return updateConfig.isLoading || restartServer.isLoading
  },[updateConfig.isLoading,restartServer.isLoading])
  return (
    <div>
      <ContentHeader title={t('文件')} />
      <div className={s0.root}>
        <div className="flex gap-2 mb-4">
          <Button
            isLoading={loading}
            onClick={() => saveAndRestart()}
            className="!px-4 !py-[3px] !text-[14px] !rounded-md"
          >
            保存并重启
          </Button>
        </div>
        <Editor
          className="w-full h-full"
          value={config}
          highlight={(code) => highlight(code, languages.yaml)}
          padding={10}
          onValueChange={onValueChange}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
      </div>
    </div>
  );
}
