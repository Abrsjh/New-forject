#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * Validates build configuration and prepares for Vercel deployment
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  if (existsSync(resolve(filePath))) {
    log(`✅ ${description}`, colors.green)
    return true
  } else {
    log(`❌ ${description}`, colors.red)
    return false
  }
}

function validatePackageJson() {
  try {
    const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'))
    
    log('\n📦 Package.json Validation:', colors.blue)
    
    // Check build script
    if (packageJson.scripts?.build === 'tsc && vite build') {
      log('✅ Build script configured correctly', colors.green)
    } else {
      log('❌ Build script missing or incorrect', colors.red)
      return false
    }
    
    // Check preview script
    if (packageJson.scripts?.preview) {
      log('✅ Preview script available', colors.green)
    } else {
      log('⚠️  Preview script missing', colors.yellow)
    }
    
    // Check required dependencies
    const requiredDeps = ['react', 'react-dom', 'zustand', 'react-router-dom']
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep])
    
    if (missingDeps.length === 0) {
      log('✅ All required dependencies present', colors.green)
    } else {
      log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, colors.red)
      return false
    }
    
    return true
  } catch (error) {
    log('❌ Error reading package.json', colors.red)
    return false
  }
}

function validateVercelConfig() {
  try {
    const vercelConfig = JSON.parse(readFileSync(resolve('vercel.json'), 'utf-8'))
    
    log('\n🚀 Vercel Configuration Validation:', colors.blue)
    
    // Check rewrites for SPA
    if (vercelConfig.rewrites?.length > 0) {
      log('✅ Client-side routing configured', colors.green)
    } else {
      log('❌ Client-side routing not configured', colors.red)
      return false
    }
    
    // Check build command
    if (vercelConfig.buildCommand) {
      log('✅ Build command specified', colors.green)
    } else {
      log('⚠️  Build command not specified (using default)', colors.yellow)
    }
    
    // Check output directory
    if (vercelConfig.outputDirectory === 'dist') {
      log('✅ Output directory configured correctly', colors.green)
    } else {
      log('⚠️  Output directory not specified (using default)', colors.yellow)
    }
    
    // Check caching headers
    if (vercelConfig.headers?.length > 0) {
      log('✅ Caching headers configured', colors.green)
    } else {
      log('⚠️  No caching headers configured', colors.yellow)
    }
    
    return true
  } catch (error) {
    log('❌ Error reading vercel.json', colors.red)
    return false
  }
}

function validateViteConfig() {
  try {
    const viteConfigContent = readFileSync(resolve('vite.config.ts'), 'utf-8')
    
    log('\n⚡ Vite Configuration Validation:', colors.blue)
    
    // Check for build optimizations
    if (viteConfigContent.includes('build:') && viteConfigContent.includes('rollupOptions')) {
      log('✅ Build optimizations configured', colors.green)
    } else {
      log('⚠️  Build optimizations not configured', colors.yellow)
    }
    
    // Check for chunk splitting
    if (viteConfigContent.includes('manualChunks')) {
      log('✅ Manual chunk splitting configured', colors.green)
    } else {
      log('⚠️  Manual chunk splitting not configured', colors.yellow)
    }
    
    // Check for dependency optimization
    if (viteConfigContent.includes('optimizeDeps')) {
      log('✅ Dependency optimization configured', colors.green)
    } else {
      log('⚠️  Dependency optimization not configured', colors.yellow)
    }
    
    return true
  } catch (error) {
    log('❌ Error reading vite.config.ts', colors.red)
    return false
  }
}

function validateIndexHtml() {
  try {
    const indexHtmlContent = readFileSync(resolve('index.html'), 'utf-8')
    
    log('\n📄 Index.html Validation:', colors.blue)
    
    // Check for meta tags
    if (indexHtmlContent.includes('meta name="description"')) {
      log('✅ SEO meta tags present', colors.green)
    } else {
      log('⚠️  SEO meta tags missing', colors.yellow)
    }
    
    // Check for Open Graph tags
    if (indexHtmlContent.includes('property="og:')) {
      log('✅ Open Graph tags present', colors.green)
    } else {
      log('⚠️  Open Graph tags missing', colors.yellow)
    }
    
    // Check for theme color
    if (indexHtmlContent.includes('name="theme-color"')) {
      log('✅ Theme color configured', colors.green)
    } else {
      log('⚠️  Theme color not configured', colors.yellow)
    }
    
    // Check for noscript fallback
    if (indexHtmlContent.includes('<noscript>')) {
      log('✅ NoScript fallback present', colors.green)
    } else {
      log('⚠️  NoScript fallback missing', colors.yellow)
    }
    
    return true
  } catch (error) {
    log('❌ Error reading index.html', colors.red)
    return false
  }
}

function main() {
  log('🔍 OpenBoard Deployment Preparation Check\n', colors.blue)
  
  const checks = [
    checkFile('package.json', 'Package.json exists'),
    checkFile('vercel.json', 'Vercel.json exists'),
    checkFile('vite.config.ts', 'Vite.config.ts exists'),
    checkFile('index.html', 'Index.html exists'),
    checkFile('src/main.tsx', 'Main entry point exists'),
    validatePackageJson(),
    validateVercelConfig(),
    validateViteConfig(),
    validateIndexHtml()
  ]
  
  const passed = checks.filter(Boolean).length
  const total = checks.length
  
  log(`\n📊 Summary: ${passed}/${total} checks passed`, colors.blue)
  
  if (passed === total) {
    log('\n🎉 All checks passed! Ready for deployment.', colors.green)
    process.exit(0)
  } else {
    log('\n⚠️  Some checks failed. Please review and fix issues before deployment.', colors.yellow)
    process.exit(1)
  }
}

main()