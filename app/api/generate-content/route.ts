import { NextRequest, NextResponse } from 'next/server'
import { generateLessonContent } from '@/lib/openai'

export async function POST(request: NextRequest) {
  console.log('\n🌐 API /generate-content endpoint called')
  const startTime = Date.now()
  
  try {
    console.log('📥 Parsing request body...')
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    const { topic, depth, learningStyle, lessonTitle, lessonDescription, duration } = body

    if (!topic || !depth || !learningStyle || !lessonTitle || !lessonDescription || !duration) {
      console.error('❌ Missing required fields:', { 
        topic: !!topic, 
        depth: !!depth,
        learningStyle: !!learningStyle, 
        lessonTitle: !!lessonTitle, 
        lessonDescription: !!lessonDescription,
        duration: !!duration 
      })
      return NextResponse.json(
        { error: 'All lesson details are required' },
        { status: 400 }
      )
    }

    console.log('✅ Request validation passed')
    console.log('🔄 Calling generateLessonContent...')
    
    const content = await generateLessonContent(topic, depth, learningStyle, lessonTitle, lessonDescription, duration)
    
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    console.log('🎉 Lesson content generation completed successfully!')
    console.log('⏱️ Total API call duration:', durationMs, 'ms')
    console.log('📤 Returning content length:', content.length, 'characters')
    
    return NextResponse.json({ content })
  } catch (error) {
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    console.error('🚨 API Error after', durationMs, 'ms:')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { error: 'Failed to generate lesson content' },
      { status: 500 }
    )
  }
}