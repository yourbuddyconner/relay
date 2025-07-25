'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const heroY = useTransform(scrollY, [0, 500], [0, -50])

  // Rotating words for the animation - focused list
  const words = ['Tee Time', 'Table', 'Reservation', 'Experience', 'Booking', 'Campsite']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 3000) // Change word every 3 seconds for better readability

    return () => clearInterval(interval)
  }, [words.length])

  if (!mounted) return null

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  // Simple fade animation - clean and readable
  const wordVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 gradient-radial animate-pulse-slow" />
      </motion.div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-50 bg-black/50 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-3xl"
              >
                🍽️
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text">
                Relay
              </h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </motion.header>

      {/* Hero Section with overflow container */}
      <div className="relative overflow-x-hidden">
        <motion.section 
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center space-y-8"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm"
            >
              <span className="animate-pulse">🔥</span>
              <span className="text-purple-300">The future of reservations is here</span>
            </motion.div>
            
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
            >
              <span className="block">Never Miss Out on</span>
              <span className="block mt-2">
                That Perfect{' '}
                <span className="inline-block relative w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWordIndex}
                      variants={wordVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="gradient-text absolute left-0 top-0"
                    >
                      {words[currentWordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  {/* Invisible text to maintain width */}
                  <span className="invisible">Appointment</span>
                </span>
              </span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 mt-8"
            >
              The first decentralized marketplace where people can safely buy and sell restaurant reservations. 
              Powered by zero-knowledge proofs for complete privacy and security.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              {!isConnected ? (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="gradient-border w-full sm:w-auto"
                >
                  <button className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-900 transition-colors w-full sm:w-auto">
                    Connect Wallet to Get Started
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                  >
                    List a Reservation
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/20 transition-colors w-full sm:w-auto"
                  >
                    Browse Listings
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Floating restaurant cards - Hidden on mobile, visible on larger screens */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 0.8,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="hidden md:block absolute top-20 left-0 lg:-left-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 cursor-pointer"
          >
            <div className="text-sm font-semibold">Carbone NYC</div>
            <div className="text-xs text-gray-400">Tonight, 8:00 PM</div>
            <div className="text-green-400 text-sm mt-1">$285</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, 10, 0]
            }}
            transition={{ 
              duration: 0.8,
              delay: 0.2,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }
            }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="hidden md:block absolute top-40 right-0 lg:-right-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 cursor-pointer"
          >
            <div className="text-sm font-semibold">Don Angie</div>
            <div className="text-xs text-gray-400">Saturday, 7:30 PM</div>
            <div className="text-green-400 text-sm mt-1">$150</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: [0, -10, 0]
            }}
            transition={{ 
              duration: 0.8,
              delay: 0.4,
              x: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }
            }}
            whileHover={{ scale: 1.1, rotate: 3 }}
            className="hidden md:block absolute bottom-20 left-10 sm:left-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 cursor-pointer"
          >
            <div className="text-sm font-semibold">Le Bernardin</div>
            <div className="text-xs text-gray-400">Friday, 9:00 PM</div>
            <div className="text-green-400 text-sm mt-1">$425</div>
          </motion.div>
        </motion.section>
      </div>

      {/* Problem Section */}
      <section className="relative z-10 py-16 sm:py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">The Problem We Solve</h3>
            <p className="text-lg sm:text-xl text-gray-400">We've all been there...</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
          >
            <motion.div 
              variants={scaleIn}
              whileHover={{ scale: 1.05, rotate: -1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 sm:p-8"
            >
              <motion.div 
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl sm:text-4xl mb-4"
              >
                😔
              </motion.div>
              <h4 className="text-lg sm:text-xl font-semibold mb-3">Plans Changed?</h4>
              <p className="text-sm sm:text-base text-gray-300">
                You made that Carbone reservation 3 months ago. Now your partner is traveling for work. 
                That $20 deposit? Gone. The perfect table? Wasted.
              </p>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 sm:p-8"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
                className="text-3xl sm:text-4xl mb-4"
              >
                🎂
              </motion.div>
              <h4 className="text-lg sm:text-xl font-semibold mb-3">Special Occasion?</h4>
              <p className="text-sm sm:text-base text-gray-300">
                It's your anniversary tomorrow and every good restaurant is booked. 
                You'd happily pay extra for that perfect table, but there's no safe way to do it.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12 sm:mt-16"
          >
            <div className="inline-flex items-center space-x-4">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-5xl sm:text-6xl"
              >
                🤝
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold gradient-text">Relay Connects You</h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-lg sm:text-xl text-gray-400">Simple, secure, seamless</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            {/* Seller Flow */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <h4 className="text-2xl font-bold mb-8 text-center">
                <span className="gradient-text">For Sellers</span>
              </h4>
              <div className="space-y-8">
                {[
                  { num: '1', title: 'List Your Reservation', desc: 'Forward your confirmation email to verify@relay.xyz with your price' },
                  { num: '2', title: 'Get Matched', desc: 'Buyers browse and purchase your listing securely' },
                  { num: '3', title: 'Transfer & Get Paid', desc: 'Cancel at the agreed time, buyer rebooks, money transfers instantly', highlight: '💰 You keep 95% of the sale price' }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    variants={fadeInUp}
                    className="flex items-start space-x-4"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold cursor-pointer"
                    >
                      {step.num}
                    </motion.div>
                    <div>
                      <h5 className="font-semibold mb-1">{step.title}</h5>
                      <p className="text-gray-400">{step.desc}</p>
                      {step.highlight && <div className="mt-2 text-green-400 font-semibold">{step.highlight}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Buyer Flow */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <h4 className="text-2xl font-bold mb-8 text-center">
                <span className="gradient-text">For Buyers</span>
              </h4>
              <div className="space-y-8">
                {[
                  { num: '1', title: 'Browse & Select', desc: 'Find the perfect reservation from verified sellers' },
                  { num: '2', title: 'Secure Purchase', desc: 'Place a refundable deposit (returned after successful transfer)' },
                  { num: '3', title: 'Claim Your Table', desc: 'Book immediately after seller cancels, enjoy your dinner!', highlight: '🎉 Guaranteed transfer or full refund' }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    variants={fadeInUp}
                    className="flex items-start space-x-4"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: -360 }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold cursor-pointer"
                    >
                      {step.num}
                    </motion.div>
                    <div>
                      <h5 className="font-semibold mb-1">{step.title}</h5>
                      <p className="text-gray-400">{step.desc}</p>
                      {step.highlight && <div className="mt-2 text-green-400 font-semibold">{step.highlight}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Transfer Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 sm:mt-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 sm:p-8"
          >
            <h4 className="text-lg sm:text-xl font-bold mb-6 text-center">The Perfect 30-Second Transfer</h4>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { time: '7:00:00 PM', icon: '🕐', desc: 'Coordination time', arrow: true },
                { time: '7:00:05 PM', icon: '❌', desc: 'Seller cancels reservation', arrow: true },
                { time: '7:00:20 PM', icon: '✅', desc: 'Buyer books the table', arrow: true },
                { time: '7:00:30 PM', icon: '💸', desc: 'Automatic payment transfer', arrow: false, success: true }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="text-xl sm:text-2xl"
                    >
                      {step.icon}
                    </motion.div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{step.time}</div>
                      <div className="text-xs sm:text-sm text-gray-400">{step.desc}</div>
                    </div>
                  </div>
                  {step.arrow && <div className="text-gray-500">→</div>}
                  {step.success && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-green-500 font-bold text-sm sm:text-base"
                    >
                      Success! 🎉
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="relative z-10 py-16 sm:py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Built for Trust</h3>
            <p className="text-lg sm:text-xl text-gray-400">Advanced technology keeps everyone safe</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              { icon: '🔐', title: 'Zero-Knowledge Proofs', desc: 'Verify reservations are real without exposing any personal information. Your privacy is guaranteed.' },
              { icon: '💰', title: 'Smart Contract Escrow', desc: 'Funds are held securely until transfer completes. No trust required - the code handles everything.' },
              { icon: '🛡️', title: 'Economic Security', desc: 'Deposits and reputation systems make bad behavior unprofitable. Good actors are rewarded.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: 'rgba(147, 51, 234, 0.5)'
                }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 sm:p-8 transition-all"
              >
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-3xl sm:text-4xl mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h4 className="text-lg sm:text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-sm sm:text-base text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Real Stories, Real Value</h3>
            <p className="text-lg sm:text-xl text-gray-400">See how Relay helps people every day</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20 rounded-lg p-6 sm:p-8"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="text-2xl sm:text-3xl">👩‍💼</div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg">Sarah's Story</h4>
                  <p className="text-xs sm:text-sm text-gray-400">Seller in NYC</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-300 italic mb-4">
                "Booked Carbone 3 months ago for our anniversary. Partner got called away on business. 
                Instead of losing everything, I listed on Relay and made $285. Took 2 minutes!"
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="text-green-400">💰 Earned $285</span>
                <span className="text-gray-500">•</span>
                <span className="text-purple-400">⏱️ 2 min effort</span>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20 rounded-lg p-6 sm:p-8"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="text-2xl sm:text-3xl">👨‍💻</div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg">James's Story</h4>
                  <p className="text-xs sm:text-sm text-gray-400">Buyer in SF</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-300 italic mb-4">
                "Forgot girlfriend's birthday. Every restaurant booked. Found Carbone on Relay, 
                perfect timing, fair price. She never knew I almost forgot!"
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="text-blue-400">🎉 Special night saved</span>
                <span className="text-gray-500">•</span>
                <span className="text-purple-400">⏱️ 5 min to book</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="gradient-border"
          >
            <div className="bg-black p-8 sm:p-12 rounded-lg">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Stop Letting Great Tables Go to Waste
              </h3>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
                Join thousands who are already making their calendar work for them
              </p>
              
              {!isConnected ? (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="gradient-border inline-block"
                >
                  <button className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-900 transition-colors gradient-shimmer">
                    Connect Wallet to Start Trading
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                  >
                    List Your First Reservation
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/20 transition-colors w-full sm:w-auto"
                  >
                    Browse Available Tables
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 sm:py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">🍽️</div>
                <span className="font-semibold">Relay Protocol</span>
              </div>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="text-xs sm:text-sm text-gray-500">Because great tables shouldn't go to waste</span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500">
              <motion.a 
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#" 
                className="hover:text-white transition-colors"
              >
                Documentation
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#" 
                className="hover:text-white transition-colors"
              >
                GitHub
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#" 
                className="hover:text-white transition-colors"
              >
                Twitter
              </motion.a>
            </div>
          </div>
        </motion.div>
      </footer>

      {/* Local Development Notice */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-4 right-4 bg-blue-600/20 backdrop-blur border border-blue-600/50 rounded-lg px-4 py-2 text-sm text-blue-300"
        >
          <span className="font-semibold">🛠️ Dev Mode</span> - Connected to Anvil
        </motion.div>
      )}
    </div>
  )
} 