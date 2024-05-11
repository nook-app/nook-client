import { Play, Volume2, VolumeX } from "@tamagui/lucide-icons";
import { Video, ResizeMode } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { TapGestureHandler } from "react-native-gesture-handler";
import { Text, View } from "tamagui";
import { useScroll } from "../../context/scroll";

export const EmbedVideo = ({
  uri,
  noBorderRadius,
}: {
  uri: string;
  noBorderRadius?: boolean;
}) => {
  const { activeVideo } = useScroll();
  const [videoRatio, setVideoRatio] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (activeVideo !== uri) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
      setIsMuted(true);
    }
  }, [activeVideo, uri]);

  const handlePlay = useCallback(() => {
    videoRef.current?.playAsync();
  }, []);

  const toggleVolume = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    videoRef.current?.presentFullscreenPlayer();
    videoRef.current?.playAsync();
    setIsMuted(false);
  };

  const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <TapGestureHandler>
      <View
        position="relative"
        justifyContent="center"
        alignItems="center"
        borderRadius={noBorderRadius ? "$0" : "$4"}
        overflow="hidden"
      >
        <View onPress={toggleFullscreen}>
          <Video
            ref={videoRef}
            style={{
              alignSelf: "center",
              aspectRatio: videoRatio,
              width: "100%",
            }}
            source={{ uri }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(status) => {
              if (!status.isLoaded) return;
              setRemaining(
                status?.durationMillis
                  ? status.durationMillis - status.positionMillis
                  : 0,
              );
              if (status.isPlaying !== playing) {
                setPlaying(status.isPlaying);
              }
            }}
            isMuted={isMuted}
            volume={1}
            onReadyForDisplay={(details) => {
              const { width, height } = details.naturalSize;
              const newVideoRatio = width / height;
              setVideoRatio(newVideoRatio);
            }}
          />
        </View>
        {!playing && (
          <View position="absolute" onPress={handlePlay}>
            <Play size={48} color="white" fill="white" />
          </View>
        )}
        <View
          position="absolute"
          left={5}
          bottom={5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          backgroundColor="rgba(0, 0, 0, 0.90)"
          paddingVertical="$1.5"
          paddingHorizontal="$2"
          borderRadius="$2"
        >
          <Text color="white" fontWeight="500" fontSize="$3">
            {formatDuration(remaining)}
          </Text>
        </View>
        <View
          position="absolute"
          right={5}
          bottom={5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={toggleVolume}
          backgroundColor="rgba(0, 0, 0, 0.90)"
          padding="$2"
          borderRadius="$10"
        >
          {isMuted ? (
            <VolumeX size={16} color="white" />
          ) : (
            <Volume2 size={16} color="white" />
          )}
        </View>
      </View>
    </TapGestureHandler>
  );
};
