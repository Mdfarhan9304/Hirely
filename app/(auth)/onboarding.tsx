import PDFUploadStep from '@/components/ui/PDFUploadStep'
import SingleInputStep from '@/components/ui/SingleInputStep'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthstore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Building2, UserSearch } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
type Role = 'job_seeker' | 'employer' | null


const Onboarding = () => {
  const [step, setStep] = useState<number>(0)
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
 
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [qualification, setQualification] = useState('')
  const [resumeUri, setResumeUri] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')
  
  // Employer data
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  
  const { user, profile, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && user && profile?.role) {
      setTimeout(() => {
        router.replace('/(tabs)')
      }, 200)
    }
  }, [user, profile, initialized])


  const getTotalSteps = () => {
    if (!selectedRole) return 1
    if (selectedRole === 'job_seeker') return 5 // Role selection + 4 steps
    return 4 // Role selection + 3 steps
  }

  const handleRoleSelection = (role: 'job_seeker' | 'employer') => {
    setSelectedRole(role)
    setStep(1) // Move to first input step
  }

  const handleNextStep = () => {
    if (step < getTotalSteps() - 1) {
      setStep(step + 1)
      setError(null)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
      setError(null)
    } else {
      setSelectedRole(null)
    }
  }

  const handleComplete = async () => {
    setError(null)
    
    if (!user) {
      // Save pending onboarding data
      try {
        const pending: any = {
          role: selectedRole,
        }
        
        if (selectedRole === 'job_seeker') {
          pending.first_name = firstName.trim()
          pending.last_name = lastName.trim()
          pending.qualification = qualification.trim()
          pending.resume_uri = resumeUri
          pending.resume_file_name = resumeFileName
        } else {
          pending.company_name = companyName.trim()
          pending.company_size = companySize.trim()
          pending.company_description = companyDescription.trim()
        }
        
        await AsyncStorage.setItem('pending_onboarding', JSON.stringify(pending))
        router.replace('/(auth)/login')
        return
      } catch (e) {
        setError('Could not save your information. Please try again.')
        return
      }
    }

    // Validate required fields
    if (selectedRole === 'job_seeker') {
      if (!firstName.trim() || !lastName.trim() || !qualification.trim()) {
        setError('Please fill in all required fields')
        return
      }
    } else {
      if (!companyName.trim() || !companySize.trim()) {
        setError('Please fill in all required fields')
        return
      }
    }

    try {
      setLoading(true)
      
      const fullName = selectedRole === 'job_seeker' 
        ? `${firstName.trim()} ${lastName.trim()}`.trim()
        : null

      const base: any = {
        user_id: user.id,
        role: selectedRole,
        full_name: fullName,
        company_name: selectedRole === 'employer' ? companyName.trim() : null,
      }

      // Add job seeker specific fields
      if (selectedRole === 'job_seeker') {
        base.first_name = firstName.trim()
        base.last_name = lastName.trim()
        base.qualification = qualification.trim()
        if (resumeUri) {
          base.resume_uri = resumeUri
          base.resume_file_name = resumeFileName
        }
      }

      // Add employer specific fields
      if (selectedRole === 'employer') {
        base.company_size = companySize.trim()
        if (companyDescription.trim()) {
          base.company_description = companyDescription.trim()
        }
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(base, { onConflict: 'user_id' })

      if (upsertError) throw upsertError

      await useAuthStore.getState().fetchProfile(user.id)
      router.replace('/(tabs)')
    } catch (e: any) {
      console.error('Error saving profile:', e)
      setError(e?.message || 'Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render role selection screen
  if (step === 0) {
    return (
      <LinearGradient
       colors={['#29B6F6',  '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']} 
       start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView className="flex-1 ">
          <View className="flex-1 px-6 pt-12">
            <Text className="text-4xl font-bold text-gray-900 font-poppins mb-2 ">
              Choose Your Path
            </Text>
            <Text className="text-lg text-gray-500 font-poppins mb-10 ">
              Select how you'd like to use Gawean
            </Text>

            <View className="flex-1">
              <TouchableOpacity
                onPress={() => handleRoleSelection('job_seeker')}
                className="p-6 rounded-2xl border-2 border-blue-500 bg-blue-50 mb-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center mb-2">
                  <UserSearch size={24} color="#29B6F6" />
                  <Text className="text-2xl font-bold text-gray-900 font-poppins ml-2">
                    Job Seeker
                  </Text>
                </View>
                <Text className="text-gray-600 font-poppins">
                  Find your dream job by swiping through opportunities
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRoleSelection('employer')}
                className="p-6 rounded-2xl border-2  border-blue-500 bg-blue-50 mb-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center mb-2">
                  <Building2 size={24} color="#29B6F6" />
                  <Text className="text-2xl font-bold text-gray-900 font-poppins ml-2">
                    Employer
                  </Text>
                </View>
                <Text className="text-gray-600 font-poppins">
                  Post jobs and find the perfect candidates
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  // Job Seeker Steps
  if (selectedRole === 'job_seeker') {
    switch (step) {
      case 1:
        return (
          <SingleInputStep
            question="What's your first name?"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            onNext={handleNextStep}
            onBack={handleBack}
            error={error}
            disabled={loading}
          />
        )
      case 2:
        return (
          <SingleInputStep
            question="What's your last name?"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            onNext={handleNextStep}
            onBack={handleBack}
            error={error}
            disabled={loading}
          />
        )
      case 3:
        return (
          <SingleInputStep
            question="What's your qualification?"
            placeholder="e.g., Software Engineer, MBA, etc."
            value={qualification}
            onChangeText={setQualification}
            onNext={handleNextStep}
            onBack={handleBack}
            error={error}
            disabled={loading}
          />
        )
      case 4:
        return (
          <PDFUploadStep
            question="Upload your resume"
            onNext={(uri, fileName) => {
              setResumeUri(uri)
              setResumeFileName(fileName)
              handleNextStep()
            }}
            onBack={handleBack}
            error={error}
          />
        )
      default:
        return null
    }
  }

  // Employer Steps
  if (selectedRole === 'employer') {
    switch (step) {
      case 1:
        return (
          <SingleInputStep
            question="What's your company name?"
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            onNext={handleNextStep}
            onBack={handleBack}
            error={error}
            disabled={loading}
          />
        )
      case 2:
        return (
          <SingleInputStep
            question="What's your company size?"
            placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
            value={companySize}
            onChangeText={setCompanySize}
            onNext={handleNextStep}
            onBack={handleBack}
            error={error}
            disabled={loading}
          />
        )
      case 3:
        return (
          <SingleInputStep
            question="Tell us about your company"
            placeholder="Company description (optional)"
            value={companyDescription}
            onChangeText={setCompanyDescription}
            onNext={handleComplete}
            onBack={handleBack}
            error={error}
            disabled={loading}
            multiline
          />
        )
      default:
        return null
    }
  }

  return null
}

export default Onboarding
