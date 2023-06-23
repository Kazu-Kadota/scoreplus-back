const sendAnswerHeaders = (token: string) => ({
  Authorization: 'Bearer ' + token,
})

export default sendAnswerHeaders
