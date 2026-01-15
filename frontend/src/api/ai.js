import { apiPath } from './apiPath';
import { httpClient } from './httpClient';

export async function createConversation(payload = {}) {
  const response = await httpClient.post(apiPath('ai/conversations'), payload);

  return response?.data;
}

export async function listConversations() {
  const response = await httpClient.get(apiPath('ai/conversations'));
  return response?.data;
}

export async function sendAiMessage({ conversationId, message, context = {} }) {
  const response = await httpClient.post(apiPath(`ai/conversations/${conversationId}/messages`), {
    message,
    context,
  });

  return response?.data;
}

export async function fetchConversation(conversationId) {
  const response = await httpClient.get(apiPath(`ai/conversations/${conversationId}`));
  return response?.data;
}

export async function deleteConversation(conversationId) {
  const response = await httpClient.delete(apiPath(`ai/conversations/${conversationId}`));
  return response?.data;
}

export async function fetchAiContext() {
  const response = await httpClient.get(apiPath('ai/context'));
  return response?.data;
}

export async function fetchConversationActions(conversationId) {
  const response = await httpClient.get(apiPath(`ai/conversations/${conversationId}/actions`));
  return response?.data;
}

export async function confirmAiAction(actionId) {
  const response = await httpClient.post(apiPath(`ai/actions/${actionId}/confirm`));
  return response?.data;
}

export async function cancelAiAction(actionId) {
  const response = await httpClient.post(apiPath(`ai/actions/${actionId}/cancel`));
  return response?.data;
}
