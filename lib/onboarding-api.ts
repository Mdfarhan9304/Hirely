import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

export interface OnboardingData {
  userId: string;
  role: 'job_seeker' | 'employer';
  firstName?: string;
  lastName?: string;
  qualification?: string;
  resumeUri?: string;
  resumeFileName?: string;
  companyName?: string;
  companySize?: string;
  companyDescription?: string;
}

export interface UploadProgress {
  progress: number;
  status: string;
}

/**
 * Uploads a resume file to Supabase Storage
 */
export async function uploadResume(
  userId: string,
  resumeUri: string,
  resumeFileName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  // If already a public URL, return it
  if (!resumeUri.startsWith('file://')) {
    return resumeUri;
  }

  try {
    onProgress?.({ progress: 0, status: 'Reading file...' });

    // Read the file
    const base64 = await FileSystem.readAsStringAsync(resumeUri, {
      encoding: 'base64',
    });

    onProgress?.({ progress: 30, status: 'Preparing upload...' });

    // Convert base64 to ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    onProgress?.({ progress: 50, status: 'Uploading to cloud...' });

    // Generate filename with timestamp
    const timestamp = Date.now();
    const fileExtension = resumeFileName.split('.').pop() || 'pdf';
    const fileName = `${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, byteArray, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    onProgress?.({ progress: 80, status: 'Getting file URL...' });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    onProgress?.({ progress: 100, status: 'Upload complete!' });

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
}

/**
 * Saves onboarding profile data to Supabase
 */
export async function saveOnboardingProfile(
  data: OnboardingData,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  try {
    onProgress?.({ progress: 0, status: 'Preparing profile...' });

    const fullName =
      data.role === 'job_seeker'
        ? `${data.firstName?.trim()} ${data.lastName?.trim()}`.trim()
        : null;

    const base: any = {
      user_id: data.userId,
      role: data.role,
      full_name: fullName,
      company_name: data.role === 'employer' ? data.companyName?.trim() : null,
    };

    // Handle job seeker data
    if (data.role === 'job_seeker') {
      base.first_name = data.firstName?.trim();
      base.last_name = data.lastName?.trim();
      base.qualification = data.qualification?.trim();

      // Upload resume if provided
      if (data.resumeUri && data.resumeFileName) {
        onProgress?.({ progress: 20, status: 'Uploading resume...' });
        const finalResumeUri = await uploadResume(
          data.userId,
          data.resumeUri,
          data.resumeFileName,
          (uploadProgress) => {
            // Map upload progress (0-100) to overall progress (20-70)
            const mappedProgress = 20 + (uploadProgress.progress * 50) / 100;
            onProgress?.({
              progress: mappedProgress,
              status: uploadProgress.status,
            });
          }
        );
        base.resume_uri = finalResumeUri;
        base.resume_file_name = data.resumeFileName;
      }
    }

    // Handle employer data
    if (data.role === 'employer') {
      base.company_size = data.companySize?.trim();
      if (data.companyDescription?.trim()) {
        base.company_description = data.companyDescription.trim();
      }
    }

    onProgress?.({ progress: 80, status: 'Saving profile...' });

    // Upsert profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(base, { onConflict: 'user_id' });

    if (upsertError) {
      throw upsertError;
    }

    onProgress?.({ progress: 100, status: 'Profile saved!' });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}















