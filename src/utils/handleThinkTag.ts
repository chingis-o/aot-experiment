export function handleThinkTag(text: string) {
  const matchBetweenTags = text.match(/<think>(.*?)<\/think>/i);
  const matchAfterTags = text.match(/<\/think>(.*)/i);

  return {
    thinking: matchBetweenTags ? matchBetweenTags[1] : "",
    result: matchAfterTags ? matchAfterTags[1] : "",
  };
}
