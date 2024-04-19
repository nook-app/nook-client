import { ScrollView, Text, View, XStack, YStack } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { uploadImage } from '@/utils/api'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { Camera } from '@tamagui/lucide-icons'
import { Label } from '@/components/Label'

export const ImageSelectorCarousel = ({
  name,
  options,
  imageUrl,
  setImageUrl,
}: {
  name?: string
  options: string[]
  imageUrl?: string
  setImageUrl: (url?: string) => void
}) => {
  return (
    <ScrollView horizontal paddingBottom="$3">
      <XStack gap="$2" alignItems="center">
        {options.map((option) => (
          <TouchableOpacity key={option} onPress={() => setImageUrl(option)}>
            <View
              borderColor="$mauve12"
              borderWidth={imageUrl === option ? '$1' : '$0'}
              borderRadius="$4"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              <View height="$10" width="$10">
                <Image
                  source={{ uri: option }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setImageUrl()}>
          <View
            borderColor="$mauve12"
            borderWidth={!imageUrl ? '$1' : '$0'}
            borderRadius="$4"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            <View
              height="$10"
              width="$10"
              justifyContent="center"
              alignItems="center"
              backgroundColor="$color5"
            >
              <Text fontSize="$10" fontWeight="500" color="$mauve12">
                {name
                  ? `${name.slice(0, 1).toUpperCase()}${name.slice(1, 2).toLowerCase()}`
                  : 'Fc'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <ImageSelector imageUrl={imageUrl} setImageUrl={setImageUrl} />
      </XStack>
    </ScrollView>
  )
}

export const ImageSelector = ({
  imageUrl,
  setImageUrl,
}: { imageUrl?: string; setImageUrl: (url?: string) => void }) => {
  const [uploadedImage, setUploadedImage] = useState<string>()

  const handleImageSelect = async () => {
    if (uploadedImage && imageUrl !== uploadedImage) {
      setImageUrl(uploadedImage)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
      selectionLimit: 1,
      allowsEditing: true,
    })

    if (result.canceled || !result.assets) return

    for (const asset of result.assets) {
      if (!asset.base64) continue
      const response = await uploadImage(asset.base64)
      setImageUrl(response.data.link)
      setUploadedImage(response.data.link)
    }
  }

  return (
    <View alignItems="center">
      <TouchableOpacity onPress={handleImageSelect}>
        <View
          borderColor="$mauve12"
          borderWidth={uploadedImage ? (uploadedImage === imageUrl ? '$1' : '$0') : '$1'}
          borderRadius="$4"
          justifyContent="center"
          alignItems="center"
          borderStyle={uploadedImage ? undefined : 'dashed'}
          overflow="hidden"
        >
          <View height="$10" width="$10" justifyContent="center" alignItems="center">
            {uploadedImage ? (
              <Image
                source={{ uri: uploadedImage }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <YStack alignItems="center">
                <Camera size={24} color="$mauve11" strokeWidth={1.5} />
                <Label>Upload</Label>
                <Text
                  color="$mauve8"
                  fontSize={10}
                  verticalAlign="middle"
                  fontWeight="500"
                >
                  (optional)
                </Text>
              </YStack>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
