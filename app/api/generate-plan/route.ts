import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/openai'

export async function POST(request: NextRequest) {
  console.log('\n🌐 API /generate-plan endpoint called')
  const startTime = Date.now()
  
  try {
    console.log('📥 Parsing request body...')
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    const { topic, depth, learningStyle } = body

    if (!topic || !depth || !learningStyle) {
      console.error('❌ Missing required fields:', { topic: !!topic, depth: !!depth, learningStyle: !!learningStyle })
      return NextResponse.json(
        { error: 'Topic, depth, and learning style are required' },
        { status: 400 }
      )
    }

    console.log('✅ Request validation passed')
    console.log('🔄 Calling generateLessonPlan...')
    
    const lessons = await generateLessonPlan(topic, depth, learningStyle)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('🎉 Lesson plan generation completed successfully!')
    console.log('⏱️ Total API call duration:', duration, 'ms')
    console.log('📤 Returning', lessons.length, 'lessons to client')
    
    return NextResponse.json({ lessons })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error('🚨 API Error after', duration, 'ms:')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}