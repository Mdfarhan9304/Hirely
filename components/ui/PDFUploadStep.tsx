import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthstore';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AnimatedProgressBar from './AnimatedProgressBar';

type PDFUploadStepProps = {
  question: string;
  onNext: (fileUri: string, fileName: string) => void;
  onClose?: () => void;
  onBack?: () => void;
  error?: string | null;
  required?: boolean;
  completionProgress?: number;
};

export default function PDFUploadStep({
  question,
  onNext,
  onClose,
  onBack,
  error,
  required = false,
  completionProgress,
}: PDFUploadStepProps) {
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthStore();

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name || 'resume.pdf',
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    // If required and no file selected, don't proceed
    if (required && !selectedFile) {
      return;
    }
    
    if (selectedFile) {
      // If user is logged in, upload to Supabase Storage immediately
      if (user?.id) {
        try {
          setUploading(true);
          
          // Read the file using expo-file-system (works with file:// URIs in React Native)
          const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
            encoding: 'base64',
          });
          
          // Convert base64 to ArrayBuffer
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          
          // Generate filename with timestamp
          const timestamp = Date.now();
          const fileExtension = selectedFile.name.split('.').pop() || 'pdf';
          const fileName = `${timestamp}.${fileExtension}`;
          const filePath = `${user.id}/${fileName}`;
          
          // Upload to Supabase Storage using ArrayBuffer
          const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, byteArray, {
              contentType: 'application/pdf',
              upsert: false,
            });
          
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);
          
          const publicUrl = urlData.publicUrl;
          
          // Pass the public URL instead of local URI
          onNext(publicUrl, selectedFile.name);
        } catch (error) {
          console.error('Error uploading resume:', error);
          // Fallback to local URI if upload fails
          onNext(selectedFile.uri, selectedFile.name);
        } finally {
          setUploading(false);
        }
      } else {
        // User not logged in yet - pass local URI, will upload later in handleComplete
        onNext(selectedFile.uri, selectedFile.name);
      }
    } else {
      // Allow skipping PDF upload
      onNext('', '');
    }
  };

  const canProceed = !loading && !uploading && (!required || selectedFile !== null);

  return (
    <View className="flex-1 bg-white">
      {/* Progress Bar */}
      {completionProgress !== undefined && (
        <View className="px-6 pt-12 pb-4">
          <AnimatedProgressBar
            progress={completionProgress}
            height={6}
            showPercentage={true}
          />
        </View>
      )}
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-8">
        <View className="w-10">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
          )}
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 pt-8">
        {/* Question with accent line */}
        <View className="flex-row items-start mb-12">
          <View className="w-1 h-12 bg-[#50c8eb] mr-4 rounded-full" />
          <View className="flex-1">
            <Text className="text-4xl font-bold text-gray-900 font-poppins" style={{ lineHeight: 48 }}>
              {question}
            </Text>
            {required && (
              <Text className="text-sm text-red-500 font-poppins mt-1">
                * Required
              </Text>
            )}
          </View>
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          onPress={pickDocument}
          disabled={loading || uploading}
          className={`border-2 border-dashed rounded-2xl p-8 items-center justify-center ${
            selectedFile ? 'border-[#50c8eb] bg-[#50c8eb]/10' : 'border-gray-300 bg-gray-50'
          }`}
          activeOpacity={0.7}
        >
          {selectedFile ? (
            <View className="items-center">
              <Ionicons name="document-text" size={48} color="#50c8eb" />
              <Text className="text-lg font-poppins font-semibold text-gray-900 mt-4 text-center">
                {selectedFile.name}
              </Text>
              <Text className="text-sm font-poppins text-gray-500 mt-2">
                Tap to change
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-poppins font-semibold text-gray-700 mt-4 text-center">
                {loading ? 'Loading...' : uploading ? 'Uploading...' : 'Tap to upload PDF'}
              </Text>
              <Text className="text-sm font-poppins text-gray-500 mt-2">
                Resume, CV, or Portfolio
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {error && (
          <Text className="text-red-500 text-sm font-poppins mt-4">{error}</Text>
        )}

        {!selectedFile && !required && (
          <TouchableOpacity
            onPress={handleNext}
            className="mt-6"
          >
            <Text className="text-center text-gray-500 font-poppins">
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next Button - Only show if file is selected (or not required) */}
      {selectedFile && (
        <View className="absolute bottom-8 right-6">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              canProceed ? 'bg-[#50c8eb]' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="arrow-forward" 
              size={28} 
              color={canProceed ? "white" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

