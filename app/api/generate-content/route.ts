import { NextRequest, NextResponse } from 'next/server'
import { generateLessonContent } from '@/lib/openai'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  logger.info('🌐 API /generate-content endpoint called')
  const startTime = Date.now()
  
  try {
    logger.info('📥 Parsing request body...')
    const body = await request.json()
    logger.info('📋 Request body received', { body })
    
    const { topic, depth, lessonTitle, lessonDescription, duration } = body

    if (!topic || !depth || !lessonTitle || !lessonDescription || !duration) {
      logger.error('❌ Missing required fields', { 
        topic: !!topic, 
        depth: !!depth, 
        lessonTitle: !!lessonTitle, 
        lessonDescription: !!lessonDescription,
        duration: !!duration 
      })
      return NextResponse.json(
        { error: 'All lesson details are required' },
        { status: 400 }
      )
    }

    logger.info('✅ Request validation passed')
    logger.info('🔄 Calling generateLessonContent...')
    
    const content = await generateLessonContent(topic, depth, lessonTitle, lessonDescription, duration)
    
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    logger.info('🎉 Lesson content generation completed successfully!')
    logger.info('⏱️ Total API call duration', { durationMs })
    logger.info('📤 Returning content', { contentLength: content.length })
    
    return NextResponse.json({ content })
  } catch (error) {
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    logger.error('🚨 API Error', { 
      durationMs, 
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { error: 'Failed to generate lesson content' },
      { status: 500 }
    )
  }
}