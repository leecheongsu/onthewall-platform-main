import React, { ReactElement } from 'react';
import imageCompression from 'browser-image-compression';
import ShortUniqueId from 'short-unique-id';
import { storageRef, storage, uploadBytes, getDownloadURL, StorageReference } from '@/lib/firebase';

// hooks
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Button, CircularProgress } from '@mui/material';

interface Props {
  imageData: {
    originalImage: { path: string; url: string };
    thumbnailImage?: { path: string; url: string };
    compressedImage?: { path: string; url: string };
  };
  setImageData: React.Dispatch<any>;
  label?: string;
  color?: string;
  isLoading?: boolean;
  setLoading?: any;
  imageUpload?: string;
}
export default function ImageUploadButton(props: Props): ReactElement {
  const { setImageData, imageData, label, color, isLoading, setLoading, imageUpload } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { i18n, t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgBase64, setImgBase64] = useState('');

  const fileSelectedHandler = (event: any) => {
    if (setLoading) {
      setLoading(true);
      if (!event.target.files[0]) {
        setLoading(false);
        return false;
      }
    }

    let imageTypeText = event.target.files[0].type;
    if (!imageTypeText.includes('image')) {
      alert(t('Please upload your image file.'));
      setLoading(false);
      return false;
    }

    const MAX_IMAGE_SIZE = 20;
    if (event.target.files[0].size > 1048576 * MAX_IMAGE_SIZE) {
      alert(
        t('Please upload image no larger than. {{size}}MB .', {
          size: MAX_IMAGE_SIZE,
        })
      );
      setLoading(false);
      return false;
    }

    let reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (base64) {
        setImgBase64(base64.toString());
      }
    };
    reader.readAsDataURL(event.target.files[0]);
    setSelectedFile(event.target.files[0]);

    return true;
  };

  const cancelNowfileUploadCase = () => {
    setImgBase64('');
    setSelectedFile(null);
  };

  const callUploadFun = () => {
    fileInputRef.current?.click();
  };

  //파일업로드관련 로직 시작
  const fileUploadHandler = async (
    selectedFileName: string
  ): Promise<{
    originalImage: string;
    compressedImage: string;
    thumbnailImage: string;
    compressedImage_350: string;
    compressedImage_750: string;
    compressedImage_1200: string;
    compressedImage_1600: string;
  }> => {
    if (!selectedFile) {
      throw new Error('No file selected.');
    }
    const thumbnailFile = await imageCompression(selectedFile, {
      maxWidthOrHeight: 500,
    });
    const compressedFile = await imageCompression(selectedFile, {
      maxWidthOrHeight: 1000,
    });
    const compressedFile_750 = await imageCompression(selectedFile, {
      maxWidthOrHeight: 750,
    });
    const compressedFile_1200 = await imageCompression(selectedFile, {
      maxWidthOrHeight: 1200,
    });
    const compressedFile_1600 = await imageCompression(selectedFile, {
      maxWidthOrHeight: 1600,
    });
    const compressedFile_350 = await imageCompression(selectedFile, {
      maxWidthOrHeight: 350,
    });

    return new Promise((resolve) => {
      const RandomText = new ShortUniqueId({ length: 10 }).randomUUID();
      // split filename to get extension
      const filenameArray = selectedFileName.split('.');
      const fileExtension = filenameArray.pop();
      const selectedFileNameWithoutExtension = filenameArray.join('.');
      // create new filename
      const originalFileName = `${selectedFileNameWithoutExtension}_${RandomText}_original.${fileExtension}`;
      const thumbnailFileName = `${selectedFileNameWithoutExtension}_${RandomText}_thumb.${fileExtension}`;
      const compressedFileName = `${selectedFileNameWithoutExtension}_${RandomText}_compressed.${fileExtension}`;
      const compressedFileName_350 = `${selectedFileNameWithoutExtension}_${RandomText}_compressed_350.${fileExtension}`;
      const compressedFileName_750 = `${selectedFileNameWithoutExtension}_${RandomText}_compressed_750.${fileExtension}`;
      const compressedFileName_1200 = `${selectedFileNameWithoutExtension}_${RandomText}_compressed_1200.${fileExtension}`;
      const compressedFileName_1600 = `${selectedFileNameWithoutExtension}_${RandomText}_compressed_1600.${fileExtension}`;
      const storageRef1: StorageReference = storageRef(storage, `paintings/${originalFileName}`);
      const storageRef2: StorageReference = storageRef(storage, `paintings/${thumbnailFileName}`);
      const storageRef3: StorageReference = storageRef(storage, `paintings/${compressedFileName}`);
      const storageRef4: StorageReference = storageRef(storage, `paintings/${compressedFileName_350}`);
      const storageRef5: StorageReference = storageRef(storage, `paintings/${compressedFileName_750}`);
      const storageRef6: StorageReference = storageRef(storage, `paintings/${compressedFileName_1200}`);
      const storageRef7: StorageReference = storageRef(storage, `paintings/${compressedFileName_1600}`);

      const task1 = uploadBytes(storageRef1, selectedFile);
      const task2 = uploadBytes(storageRef2, thumbnailFile);
      const task3 = uploadBytes(storageRef3, compressedFile);
      const task4 = uploadBytes(storageRef4, compressedFile_350);
      const task5 = uploadBytes(storageRef5, compressedFile_750);
      const task6 = uploadBytes(storageRef6, compressedFile_1200);
      const task7 = uploadBytes(storageRef7, compressedFile_1600);
      Promise.all([task1, task2, task3, task4, task5, task6, task7]).then(() => {
        resolve({
          originalImage: originalFileName,
          compressedImage: compressedFileName,
          thumbnailImage: thumbnailFileName,
          compressedImage_350: compressedFileName_350,
          compressedImage_750: compressedFileName_750,
          compressedImage_1200: compressedFileName_1200,
          compressedImage_1600: compressedFileName_1600,
        });
      });
    });
  };

  //파일업로드관련 로직 끝
  const onImageSubmit = async () => {
    let uploadedFileNames: { [key: string]: string } = {};
    let fileNames: string[] = [];

    if (selectedFile !== null) {
      uploadedFileNames = await fileUploadHandler(selectedFile.name);
      fileNames = Object.keys(uploadedFileNames);

      fileNames.forEach((fileName) => {
        const imagePath = `paintings/${uploadedFileNames[fileName]}`;

        const storageReference: StorageReference = storageRef(storage, imagePath);

        getDownloadURL(storageReference)
          .then((imgUrl: string) => {
            setImageData((prev: any) => ({
              ...prev,
              [fileName]: { url: imgUrl, path: imagePath },
            }));
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error getting download URL:', error);
            setLoading(false);
          });
      });
    }
  };

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    onImageSubmit();
  }, [selectedFile]);
  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Button
          onClick={callUploadFun}
          variant="outlined"
          sx={{
            fontSize: '14px',
            borderColor: color ? color : 'primary',
            color: color ? color : 'primary',
            textTransform: 'capitalize',
          }}
        >
          {t('Upload Image')}
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        name="imgFile"
        id="imgFile"
        onChange={fileSelectedHandler}
      />
    </>
  );
}
