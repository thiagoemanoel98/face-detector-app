import React, { useEffect, useState } from "react";
import { ImageSourcePropType, View } from "react-native";
import { styles } from "./styles";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import neutro from "../../assets/neutro.png";
import smiling from "../../assets/smiling2.png";
import winkingLeft from "../../assets/winking-left.png";
import winkingRight from "../../assets/winking-right.png";

export default function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [ratio, setRatio] = useState("16:9");
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutro);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    requestPermission();
  }, []);

  const animatedStyle = useAnimatedStyle(
    () => ({
      position: "absolute",
      zIndex: 1,
      width: faceValues.value.width,
      height: faceValues.value.height,
      transform: [
        { translateX: faceValues.value.x },
        { translateY: faceValues.value.y },
      ],
    }),
    []
  );

  if (!permission?.granted) {
    return;
  }

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;
      setFaceDetected(true);

      faceValues.value = {
        width: size.width,
        height: size.height-40,
        x: origin.x,
        y: origin.y,
      };

      if (face.smilingProbability > 0.5) {
        setEmoji(smiling);
      } else if (
        face.leftEyeOpenProbability > 0.3 &&
        face.rightEyeOpenProbability < 0.5
      ) {
        setEmoji(winkingLeft);
      } else if (
        face.leftEyeOpenProbability < 0.5 &&
        face.rightEyeOpenProbability > 0.3
      ) {
        setEmoji(winkingRight);
      } else {
        setEmoji(neutro);
      }
    } else {
      setFaceDetected(false);
    }
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera
        style={styles.container}
        type={CameraType.front}
        ratio={ratio}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
