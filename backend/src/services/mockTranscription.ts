export async function transcribeAudio(audioUrl: string): Promise<string> {
  // Return mock transcript text
  return `
    Meeting with client John Smith on March 15th, 2026.
    
    John: I need the project proposal by next Friday, March 21st.
    John: The budget should be around $15,000.
    John: Sarah will handle the design work.
    
    Sarah: I can deliver the designs by Thursday, March 20th.
    Sarah: I'll need the content from the marketing team.
    
    John: Let's schedule a follow-up for next week.
  `;
}
