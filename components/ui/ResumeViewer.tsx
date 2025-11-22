import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native';

interface ResumeViewerProps {
  visible: boolean;
  resumeUri: string;
  resumeFileName?: string;
  onClose: () => void;
}

export default function ResumeViewer({
  visible,
  resumeUri,
  resumeFileName,
  onClose,
}: ResumeViewerProps) {
  const handleViewResume = async () => {
    try {
      // Check if it's a URL (starts with http/https)
      if (resumeUri.startsWith('http://') || resumeUri.startsWith('https://')) {
        // Open in browser
        await WebBrowser.openBrowserAsync(resumeUri);
      } else if (resumeUri.startsWith('file://')) {
        // For local files, try to open with system viewer
        const canOpen = await Linking.canOpenURL(resumeUri);
        if (canOpen) {
          await Linking.openURL(resumeUri);
        } else {
          alert('Unable to open resume file');
        }
      } else {
        // Try to open as URL anyway
        await Linking.openURL(resumeUri);
      }
    } catch (error) {
      console.error('Error opening resume:', error);
      alert('Unable to open resume. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      if (resumeUri.startsWith('http://') || resumeUri.startsWith('https://')) {
        // For web URLs, open in browser (user can download from there)
        await WebBrowser.openBrowserAsync(resumeUri);
      } else {
        // For local files, try to open
        await Linking.openURL(resumeUri);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Unable to download resume. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900 font-poppins">
              Resume
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {resumeFileName && (
            <Text className="text-base text-gray-600 font-poppins mb-4">
              {resumeFileName}
            </Text>
          )}

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleViewResume}
              className="flex-row items-center justify-center bg-[#50c8eb] rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={24} color="white" />
              <Text className="text-white text-lg font-semibold font-poppins ml-2">
                View Resume
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownload}
              className="flex-row items-center justify-center bg-gray-200 rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={24} color="#1F2937" />
              <Text className="text-gray-900 text-lg font-semibold font-poppins ml-2">
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

















