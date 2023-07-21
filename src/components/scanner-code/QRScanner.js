import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import QrScanner from 'qr-scanner';
import { BackScannerButton } from './BackScannerButton';
import { FlashScannerButton } from './FlashScannerButton';

import translation from '../../config/languages/es';
import './QRScanner.scss';

let stopScan = false;
let scanner;
function QRScanner({ handleResult, handleBack }) {
  const [t] = useTranslation();
  const [hasFlash, setHasFlash] = useState(false);
  const [cameraList, setCameraList] = useState([
    {
      value: 'environment',
      text: t(translation.translation.MAIN_CAMERA),
    },
    { value: 'user', text: t(translation.translation.FRONT_CAMERA) },
  ]);
  const [camera, setCamera] = useState('environment');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  const updateFlashAvailability = (scanner) => {
    scanner.hasFlash().then((hasFlash) => {
      setHasFlash(hasFlash);
    });
  };

  const handleSelected = (e) => {
    setCamera(e.target.value);
    scanner.setCamera(e.target.value).then(updateFlashAvailability);
  };

  const handleFlash = async () => {
    await scanner.toggleFlash();
  };

  const handleExit = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
    }

    handleBack();
  };

  const warecloudScan = useCallback(async (isScan = true) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (isScan) stopScan = true;
    if (!isScan) return;
    stopScan = false;
    scanner = new QrScanner(
      document.getElementById('scan-view'),
      (result) => {
        handleResult(result.data, scanner);
        setError('');
      },
      {
        onDecodeError: (err) => {
          setError(err);
        },
        maxScansPerSecond: 1,
        highlightScanRegion: true,
        returnDetailedScanResult: true,
        highlightCodeOutline: true,
      }
    );

    scanner
      .start()
      .then(() => {
        setLoading(false);
        updateFlashAvailability(scanner);

        debugger;
        QRScanner.listCameras(true).then((cameras) => console.log(cameras));
      })
      .catch(() => setLoading(false));

    while (!stopScan) {
      await new Promise((r) => setTimeout(r, 100));
    }
    scanner.stop();
    scanner.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    warecloudScan();

    return () => {
      scanner.stop();
      scanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      mb={7}
      sx={{
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderStyle: 'dashed',
          padding: '5px',
          borderRadius: '16px',
          backgroundColor: 'white',
        }}
      >
        {loading && (
          <CircularProgress
            sx={{ position: 'absolute', top: '45%', left: '45%' }}
            variant="indeterminate"
          />
        )}

        <video id="scan-view"></video>
      </Box>

      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        mt={1}
      >
        <Grid item xs="auto">
          <BackScannerButton handleBack={handleExit} />
        </Grid>

        <Grid item xs={7}>
          <FormControl fullWidth>
            <InputLabel id="camera-label">Escoge la camara</InputLabel>
            <Select
              autoWidth
              labelId="camera-label"
              id="camera-id"
              value={camera}
              label="Escoge la camara"
              onChange={handleSelected}
              defaultValue="environment"
            >
              {cameraList.map((camera, index) => (
                <MenuItem key={`camera-${index}`} value={camera.value}>
                  {camera.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          {hasFlash && (
            <FlashScannerButton
              isFlashOn={scanner.isFlashOn()}
              handleFlash={handleFlash}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default QRScanner;
