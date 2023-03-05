/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Head from 'next/head';
import axios from 'axios';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  chakra,
  Heading,
  Text,
  Flex,
  FormLabel,
  FormControl,
  Input,
  Button,
  Center,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import formItems from '../assets';
import { base64LoadingGif } from '../assets';
import Compressor from 'compressorjs';

const Home: NextPage = () => {
  enum DisplayMode {
    SelectImg = 'select img',
    CropImg = 'scrop img',
    InputParameter = 'input parameter',
    DisplayQRcode = 'display qrcode',
    DisplayResult = 'display result',
    IsLoading = 'is loading',
  }

  const [formValues, setFormValues] = useState<any>({
    img_string: '',
    data: 'https://www.okayama-u.ac.jp',
    version: '5',
    ecc_level: '0',
    encoding: '0',
    mask_pattern: '0',
    traial_times: '50',
    threshold: '96',
    scale: '50',
    variance: '0.7',
    y_axis: '0.5',
    x_axis: '0.5',
  });
  const [resultQrcodeStr, setResultQrcodeStr] = useState('');
  const [resultImgStr, setResultImgStr] = useState('');
  const [selectedImgStr, setSelectedImgStr] = useState('');
  const [isDisplayResult, setIsDisplayResult] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState({ x: 0, y: 0 });
  const [isGetOriginalImgSize, setIsGetOriginalImgSize] = useState(false);
  const [originalImgSize, setOriginalImgSize] = useState({
    x: 0,
    y: 0,
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    DisplayMode.SelectImg
  );

  const [parameters, setParameters] = useState({
    central_x_coordinate: '',
    central_y_coordinate: '',
    y_axis: '',
    x_axis: '',
    scale: '',
  });

  const [crop, setCrop] = useState<Crop>({
    unit: 'px', // Can be 'px' or '%'
    x: 100,
    y: 100,
    width: 150,
    height: 150,
  });

  function handleOnAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const reader = new FileReader();
    const img: File = e.target.files[0];

    if (img == null) return;

    if (img.size > 1024 * 1024 * 3) {
      alert(
        `3MB以上のファイルは扱うことができません\n入力されたファイルサイズは${roundFloat(
          img.size / 1024 / 1024
        )}MBです`
      ); // エラーメッセージを表示
      return;
    }

    console.log('img !== null');

    new Compressor(img, {
      quality: 0.5,

      success(result) {
        const compressedImg: File = result as File;

        console.log({ result });

        reader.readAsDataURL(compressedImg);
        reader.onload = () => {
          if (reader.result == null) return;
          console.log('圧縮後の画像(base64)');

          const compressed_data_uri = reader.result;
          handleChangeFormValues('img_string', compressed_data_uri);
          console.log({ compressed_data_uri });
        };
        setDisplayMode(DisplayMode.CropImg);
      },
      error(err) {
        console.log(err.message);
        console.log('Compressorが上手く動いていない');
      },
    });
  }

  function calculateParameters() {
    handleChangeParameter(
      'central_x_coordinate',
      String(crop.x + crop.width / 2)
    );
    handleChangeParameter(
      'central_y_coordinate',
      String(crop.y + crop.height / 2)
    );
    handleChangeParameter(
      'x_axis',
      String(roundFloat((crop.x + crop.width / 2) / originalImgSize.x))
    );
    handleChangeParameter(
      'y_axis',
      String(roundFloat((crop.y + crop.height / 2) / originalImgSize.y))
    );

    if (originalImgSize.x >= originalImgSize.y) {
      handleChangeParameter(
        'scale',
        String(roundFloat(crop.height / originalImgSize.y) * 100)
      );
    } else {
      handleChangeParameter(
        'scale',
        // scaleは整数で入力する必要があるため，追加で×100している
        String(roundFloat(crop.width / originalImgSize.x, 100) * 100)
      );
    }
  }

  function getImgSize() {
    console.log('execute getImgSize');
    var element: HTMLImageElement | null = document.getElementById(
      'crop'
    ) as HTMLImageElement;
    if (element == null) return;
    var width = element.width;
    var height = element.height;
    handleChangeOriginalImgSize('x', width);
    handleChangeOriginalImgSize('y', height);
    setIsGetOriginalImgSize(true);
  }

  // 数値の小数点以下を丸める関数．デフォルトでは小数点第三位以下を切り捨てする仕様にした．
  function roundFloat(input: number, digit = 100) {
    return Math.round(input * digit) / digit;
  }

  function handleChangeFormValues(name: string, value: string | ArrayBuffer) {
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  }

  function handleChangeParameter(name: string, value: string) {
    console.log(`${name};${value}`);
    setParameters((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeOriginalImgSize(name: string, value: number) {
    console.log(`${name};${value}`);
    setOriginalImgSize((prev) => ({ ...prev, [name]: value }));
  }

  async function hundleSubmit() {
    console.log('execute onSubmit');
    console.log(formValues);
    const startTime = Date.now(); // 開始時間

    try {
      setDisplayMode(DisplayMode.IsLoading);
      const response = await axios.post(
        // 'https://design-qrcode-api.herokuapp.com/api/create_qrcode',
        'http://localhost:8080/api/create_qrcode',
        formValues
      );
      const endTime = Date.now(); // 終了時間
      console.log('API応答時間');
      console.log(endTime - startTime); // 何ミリ秒かかったかを表示する
      setResultQrcodeStr(response.data.qrcode_base64);
      setResultImgStr(response.data.output_base64);
      console.log('response.data');
      console.log(response.data);
      setDisplayMode(DisplayMode.DisplayResult);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <chakra.div bgColor="#fffdfa" minH="100vh">
      <Head>
        <title>Design QRcode Generator</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex flexDirection={'column'} alignItems={'center'} py={'12'}>
        <Heading size={'3xl'}>Design QRcode Generator</Heading>
        {displayMode == DisplayMode.SelectImg && (
          <Box mt="24">
            <Text fontSize={'2xl'} pt={'4'} fontWeight="medium">
              QRコードの背景画像に設定する画像を選択してください．
            </Text>
            <FormControl w="xl">
              <Input
                mt="4"
                borderColor="darkgray"
                fontWeight="black"
                type="file"
                accept="image/*,.png,.jpg,.jpeg,"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleOnAddImage(e);
                }}
              />
            </FormControl>
          </Box>
        )}
        {displayMode == DisplayMode.CropImg && (
          <>
            <Text fontSize={'2xl'} pt={'4'}>
              QRコード化する範囲を指定してください．
            </Text>
            <Box width="550px">
              <ReactCrop
                crop={crop}
                aspect={1}
                onChange={(c) => {
                  if (!isGetOriginalImgSize) getImgSize();
                  setCrop(c);
                  console.log(crop);
                  calculateParameters();
                  console.log({ originalImgSize });
                  var element: HTMLImageElement | null =
                    document.getElementById('crop') as HTMLImageElement;
                  console.log({ 'element.currentSrc': element.currentSrc });
                }}
              >
                <chakra.img
                  id="crop"
                  src={`${formValues.img_string}`}
                  alt="切り抜き前画像"
                  height="auto"
                  maxWidth="100%"
                />
              </ReactCrop>
            </Box>
            <Flex mt="4" gap="8">
              <Button
                colorScheme="facebook"
                onClick={() => {
                  console.log('clicked 確定 button');
                  handleChangeFormValues('scale', parameters.scale);
                  handleChangeFormValues('x_axis', parameters.x_axis);
                  handleChangeFormValues('y_axis', parameters.y_axis);
                  setDisplayMode(DisplayMode.InputParameter);
                  setIsGetOriginalImgSize(false);
                }}
              >
                確定
              </Button>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.SelectImg);
                }}
                colorScheme="blackAlpha"
              >
                別の画像を選択する
              </Button>
            </Flex>
          </>
        )}
        {displayMode == DisplayMode.InputParameter && (
          <>
            <Text fontSize={'2xl'} mt="4">
              パラメータを入力してください．
            </Text>
            {formItems.map((item: { label: string; name: string }) => (
              <Box key={item.label}>
                <FormLabel htmlFor="name" mt="4" w="max" fontWeight="bold">
                  {item.name}
                </FormLabel>
                <Input
                  key={item.label}
                  w="xl"
                  borderColor="blackAlpha.400"
                  id={item.label}
                  variant="filled"
                  value={formValues[item.label]}
                  placeholder={item.label}
                  backgroundColor="blue.50"
                  onChange={(e) => {
                    handleChangeFormValues(item.label, e.target.value);
                    console.log(originalImgSize);
                  }}
                />
              </Box>
            ))}
            <Flex mt="10" gap={4}>
              <Button
                onClick={() => {
                  console.log(formValues);
                  hundleSubmit();
                }}
                colorScheme="facebook"
              >
                QRコード作成
              </Button>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.SelectImg);
                }}
                colorScheme="blackAlpha"
              >
                別の画像を選択する
              </Button>
            </Flex>
          </>
        )}
        {displayMode == DisplayMode.IsLoading && (
          <Flex mt="100" flexFlow="column">
            <Text fontSize="4xl">デザインQRコードを作成中...</Text>
            <chakra.img
              src={base64LoadingGif}
              alt="loading"
              width="100px"
              height="100px"
              mx="auto"
              mt="4"
            />
          </Flex>
        )}
        {displayMode == DisplayMode.DisplayQRcode && (
          <>
            <Center
              bgColor="blackAlpha.400"
              width="700px"
              height="700px"
              mt="12"
              borderRadius="100px"
            >
              <chakra.img
                src={`data:image/jpeg;base64,${resultQrcodeStr}`}
                alt="デザインQRコード"
                width="400"
                height="400"
              />
            </Center>
            <Flex gap={12}>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.DisplayResult);
                }}
                colorScheme="facebook"
                mt="4"
              >
                全体画像に切り替える
              </Button>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.SelectImg);
                  setResultImgStr('');
                }}
                colorScheme="blackAlpha"
                mt="4"
              >
                別の画像で試す
              </Button>
              <Button
                as="a"
                href={`data:image/jpeg;base64,${resultQrcodeStr}`}
                download
                bgColor="green.500"
                color="white"
                mt="4"
                mr="4"
                _hover={{
                  color: 'blue.500',
                  bgColor: 'white',
                  border: '1px',
                  borderColor: 'blue.500',
                }}
              >
                <BiDownload size="30px" />
              </Button>
            </Flex>
          </>
        )}
        {displayMode == DisplayMode.DisplayResult && (
          <>
            <Center
              bgColor="blackAlpha.400"
              width="700px"
              height="700px"
              mt="12"
              borderRadius="100px"
            >
              <chakra.img
                src={`data:image/jpeg;base64,${resultImgStr}`}
                alt="デザインQRコード"
                maxW="580px"
                maxH="580px"
              />
            </Center>
            <Flex gap={12}>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.DisplayQRcode);
                }}
                colorScheme="facebook"
                mt="4"
              >
                QRコードに切り替える
              </Button>
              <Button
                onClick={() => {
                  setDisplayMode(DisplayMode.SelectImg);
                  setResultImgStr('');
                }}
                colorScheme="blackAlpha"
                mt="4"
              >
                別の画像で試す
              </Button>
              <Button
                as="a"
                href={`data:image/jpeg;base64,${resultImgStr}`}
                download
                bgColor="green.500"
                color="white"
                mt="4"
                mr="4"
                _hover={{
                  color: 'blue.500',
                  bgColor: 'white',
                  border: '1px',
                  borderColor: 'blue.500',
                }}
              >
                <BiDownload size="30px" />
              </Button>
            </Flex>
          </>
        )}
      </Flex>
      <Flex
        position="sticky"
        top="100vh"
        w="100%"
        h="60px"
        bgColor="blackAlpha.400"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="xl">
          ※QRコード (QR Code) は株式会社デンソーウェーブの登録商標です
        </Text>
      </Flex>
    </chakra.div>
  );
};

export default Home;
