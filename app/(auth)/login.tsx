import GradientButton from '@/components/ui/GradientButton'
import TextField from '@/components/ui/TextField'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthstore'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Login = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const passwordRef = useRef<TextInput>(null)
  const { user, profile, initialized } = useAuthStore()

  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email' : null

  // Track component mount state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Redirect if already logged in with profile
  useEffect(() => {
    if (!initialized || !isMounted) return
    if (user && profile?.role) {
      console.log('✅ Already logged in, redirecting to home');
      router.replace('/(tabs)')
    }
  }, [user, profile, initialized, isMounted])

  const handleResetPassword = async () => {
    setError(null)
    if (!email || emailError) {
      setError('Enter a valid email to reset password')
      return
    }
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',
      })
      if (error) throw error
      setError('Password reset link sent. Check your email.')
    } catch (e: any) {
      setError(e?.message || 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    setError(null)
    if (!email || !password || emailError) {
      setError(emailError || 'Please enter email and password')
      return
    }
    try {
      setLoading(true)
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        if (data.session?.user) {
          console.log('✅ Account created with session, going to onboarding')
          router.replace('/(auth)/onboarding')
          return
        }

        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (signInError) throw signInError
          console.log('✅ Auto sign-in after signup succeeded, going to onboarding')
          router.replace('/(auth)/onboarding')
          return
        } catch (autoErr: any) {
          const amsg = String(autoErr?.message || '')
          console.log('ℹ️ Auto sign-in after signup failed:', amsg)
          setError(amsg.toLowerCase().includes('email not confirmed')
            ? 'Account created. Please confirm your email, then sign in.'
            : 'Account created successfully! Please sign in below.')
          setMode('signin')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        console.log('✅ Sign in successful, checking profile...')
        const userId = data.user?.id
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', userId)
            .single()
          
          if (!profile?.role) {
            console.log('👤 No profile found, going to onboarding')
            router.replace('/(auth)/onboarding')
          } else {
            console.log('🏠 Profile exists, going to main app')
            router.replace('/(tabs)')
          }
        } else {
          router.replace('/(tabs)')
        }
      }
    } catch (e: any) {
      const msg = String(e?.message || '')
      console.log('❌ Auth error:', msg)
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password.')
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email before signing in.')
      } else {
        setError(msg || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1">
      {/* Top Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2071' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
        }}
      />
      
      {/* Gradient Overlay - seamless blend from blue to transparent */}
      <LinearGradient
        colors={['#50c8eb',  'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 items-center justify-center px-6">
              {/* Professional Header */}
              <View className="items-center mb-10">
                <View className="mb-6">
                  {/* <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-18 h-18 rounded-2xl items-center justify-center"
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      elevation: 10,
                    }}
                  >
                    <Text className="text-4xl font-bold text-white" style={{ letterSpacing: -1 }}>G</Text>
                  </LinearGradient> */}
                </View>
                <Text className="text-3xl font-jost font-semibold   text-white mb-2" style={{ letterSpacing: -0.5 }}>Hirely</Text>
                <Text className="text-base text-white/90  font-poppins font-medium">
                  {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
                </Text>
              </View>

              {/* Professional Form Card */}
                <View className="w-full">
                  <TextField
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    errorText={emailError}
                  />

                  <View className="h-5" />

                  <TextField
                    ref={passwordRef}
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    returnKeyType="go"
                    onSubmitEditing={handleAuth}
                  />

                  <View className="flex-row items-center justify-between mt-5">
                    <View className="flex-row items-center gap-x-2.5">
                      <Switch 
                        value={remember} 
                        onValueChange={setRemember}
                        trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#CBD5E1"
                      />
                      <Text className="text-sm text-white font-medium">Remember me</Text>
                    </View>
                    <TouchableOpacity onPress={handleResetPassword} activeOpacity={0.7}>
                      <Text className="text-sm text-white font-semibold">Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {error ? (
                    <View className="bg-red-500/90 border border-red-400 rounded-xl p-4 mt-5">
                      <Text className="text-white text-sm font-medium leading-5">{error}</Text>
                    </View>
                  ) : null}

                  <View className="h-6" />

                  <GradientButton 
                    title={mode === 'signup' ? 'Create Account' : 'Sign In'} 
                    onPress={handleAuth} 
                    disabled={loading}
                    styleClassName=""
                  />
                </View>
             

              {/* Professional Footer */}
              <View className="w-full max-w-md mt-8">
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-white/30" />
                  <Text className="px-4 text-xs text-white/70 font-semibold" style={{ letterSpacing: 0.5 }}>OR</Text>
                  <View className="flex-1 h-px bg-white/30" />
                </View>

                <TouchableOpacity 
                  className="items-center py-4 px-6 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm"
                  onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-white font-medium">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <Text className="text-white font-bold underline">
                      {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Professional Footer Note */}
              <Text className="text-xs text-white/70 text-center mt-6 px-5 leading-4.5">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

export default Login