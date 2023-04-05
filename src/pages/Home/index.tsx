import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { styles } from "./styles";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import Animated, {
    useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export default function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [ratio, setRatio] = useState("16:9");
  const [faceDetected, setFaceDetected] = useState(false);

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
      borderColor: "blue",
      borderWidth: 10,
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
        height: size.height,
        x: origin.x,
        y: origin.y,
      };
    } else {
      setFaceDetected(false);
    }
  }

   return (
    <View style={styles.container}>
      {faceDetected && <Animated.View style={animatedStyle} />}
      <Camera
        style={styles.container}
        type={CameraType.front}
        ratio={ratio}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
