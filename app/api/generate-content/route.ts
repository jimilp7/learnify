import { NextRequest, NextResponse } from 'next/server'
import { generateLessonContent } from '@/lib/openai'
import { log } from '@/lib/logger'

export async function POST(request: NextRequest) {
  log.info('🌐 API /generate-content endpoint called')
  const startTime = Date.now()
  
  try {
    log.debug('📥 Parsing request body...')
    const body = await request.json()
    log.debug('📋 Request body:', body)
    
    const { topic, depth, lessonTitle, lessonDescription, duration } = body

    if (!topic || !depth || !lessonTitle || !lessonDescription || !duration) {
      log.error('❌ Missing required fields:', { 
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

    log.info('✅ Request validation passed')
    log.info('🔄 Calling generateLessonContent...')
    
    const content = await generateLessonContent(topic, depth, lessonTitle, lessonDescription, duration)
    
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    log.info('🎉 Lesson content generation completed successfully!')
    log.info('⏱️ Total API call duration:', { duration_ms: durationMs })
    log.info('📤 Returning content', { content_length: content.length })
    
    return NextResponse.json({ content })
  } catch (error) {
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    log.error('🚨 API Error', { duration_ms: durationMs })
    log.error('Error type:', { error_type: error instanceof Error ? error.constructor.name : typeof error })
    log.error('Error message:', { error_message: error instanceof Error ? error.message : String(error) })
    
    return NextResponse.json(
      { error: 'Failed to generate lesson content' },
      { status: 500 }
    )
  }
}