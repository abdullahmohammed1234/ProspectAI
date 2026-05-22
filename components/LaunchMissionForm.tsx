'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface FormData {
  serviceOffering: string
  targetIndustry: string
  geography: string
  companySize: string
  targetRole: string
  keywords: string
}

interface FormErrors {
  [key: string]: string
}

const SMART_SUGGESTIONS = {
  serviceOffering: [
    'SaaS platform',
    'B2B marketing',
    'Cloud consulting',
    'IT infrastructure',
    'Data analytics'
  ],
  targetIndustry: [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Education'
  ],
  geography: [
    'United States',
    'Canada',
    'United Kingdom',
    'Europe',
    'Asia Pacific',
    'Global'
  ],
  companySize: [
    '1-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees',
    'Enterprise'
  ],
  targetRole: [
    'CEO/Founder',
    'VP Sales',
    'Sales Director',
    'Marketing Manager',
    'Operations Manager',
    'CTO/VP Engineering'
  ]
}

export default function LaunchMissionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    serviceOffering: '',
    targetIndustry: '',
    geography: '',
    companySize: '',
    targetRole: '',
    keywords: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState<{ [key: string]: boolean }>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.serviceOffering.trim()) {
      newErrors.serviceOffering = 'Service Offering is required'
    }
    if (!formData.targetIndustry.trim()) {
      newErrors.targetIndustry = 'Target Industry is required'
    }
    if (!formData.geography.trim()) {
      newErrors.geography = 'Geography is required'
    }
    if (!formData.companySize.trim()) {
      newErrors.companySize = 'Company Size is required'
    }
    if (!formData.targetRole.trim()) {
      newErrors.targetRole = 'Target Role is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSuggestionClick = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setShowSuggestions(prev => ({
      ...prev,
      [field]: false
    }))
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Redirect to execution timeline
    router.push('/missions/execution')
  }

  const formFields = [
    {
      name: 'serviceOffering',
      label: 'Service Offering',
      placeholder: 'e.g., SaaS platform, B2B marketing, consulting...',
      suggestions: SMART_SUGGESTIONS.serviceOffering
    },
    {
      name: 'targetIndustry',
      label: 'Target Industry',
      placeholder: 'e.g., Technology, Financial Services, Healthcare...',
      suggestions: SMART_SUGGESTIONS.targetIndustry
    },
    {
      name: 'geography',
      label: 'Geography',
      placeholder: 'e.g., United States, Europe, Global...',
      suggestions: SMART_SUGGESTIONS.geography
    },
    {
      name: 'companySize',
      label: 'Company Size',
      placeholder: 'e.g., 1-50 employees, 1000+ employees...',
      suggestions: SMART_SUGGESTIONS.companySize
    },
    {
      name: 'targetRole',
      label: 'Target Role',
      placeholder: 'e.g., CEO, VP Sales, Marketing Manager...',
      suggestions: SMART_SUGGESTIONS.targetRole
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/40 to-green-500/40 flex items-center justify-center border border-blue-400/30">
            <span className="text-lg font-bold">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Launch Mission
          </h1>
        </div>
        <p className="text-gray-400">Configure your autonomous prospecting parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
              <span className="text-red-400 ml-1">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleInputChange}
                onFocus={() => {
                  setActiveField(field.name)
                  setShowSuggestions(prev => ({
                    ...prev,
                    [field.name]: true
                  }))
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setActiveField(null)
                    setShowSuggestions(prev => ({
                      ...prev,
                      [field.name]: false
                    }))
                  }, 200)
                }}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                  errors[field.name]
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-400 focus:bg-red-500/10'
                    : activeField === field.name
                    ? 'border-blue-400/50 bg-blue-500/5 focus:border-blue-400 shadow-lg shadow-blue-500/20'
                    : formData[field.name as keyof FormData]
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              />

              {/* Animated success indicator */}
              {formData[field.name as keyof FormData] && !errors[field.name] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                >
                  ✓
                </motion.div>
              )}

              {/* Error message */}
              <AnimatePresence>
                {errors[field.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-1 flex items-center gap-1"
                  >
                    ⚠ {errors[field.name]}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Smart suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions[field.name] && formData[field.name as keyof FormData] === '' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-2 card !p-3"
                  >
                    <p className="text-xs text-gray-400 mb-3">Smart suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {field.suggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(field.name, suggestion)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-400/30 hover:border-blue-400/60 transition-all"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {/* Keywords field */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Optional Keywords
            <span className="text-gray-500 text-xs ml-2">(comma-separated)</span>
          </label>
          <textarea
            name="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            placeholder="e.g., growth, SaaS, venture-backed..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 focus:bg-blue-500/5 transition-all duration-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            These keywords will help narrow down target accounts for your mission
          </p>
        </motion.div>

        {/* Submit button with loading state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="pt-6"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-lg font-semibold text-white relative overflow-hidden group transition-all duration-300"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 opacity-100 group-hover:opacity-90 transition-opacity" />

            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-lg border border-blue-300/50 group-hover:border-blue-300 transition-colors" />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2 h-full">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.15,
                            repeat: Infinity
                          }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      ))}
                    </div>
                    <span className="text-sm">Initializing mission protocols...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>🚀 Launch Mission</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </motion.div>

        {/* Info callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card !bg-gradient-to-r from-blue-500/10 to-green-500/10 !border-blue-400/20 !p-4"
        >
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-300">💡 Pro tip:</span> Your mission will begin executing immediately after launch. The AI will research target accounts, identify decision-makers, and begin drafting personalized outreach sequences.
          </p>
        </motion.div>
      </form>
    </motion.div>
  )
}
