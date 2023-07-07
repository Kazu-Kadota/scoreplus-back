import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'
import getStringEnv from 'src/utils/get-string-env'

const IS_LOCAL = getStringEnv('IS_LOCAL')

const renderTemplate = async <Data>(templateName: string, templateData: Data) => {
  console.log(IS_LOCAL)
  let filePath

  if (IS_LOCAL) {
    filePath = path.join(__dirname, '..', '..', '..', '..', 'templates', 'requestplus')
  } else {
    filePath = path.join(__dirname, '..', '..', '..', 'templates', 'requestplus')
  }
  console.log(filePath)

  const [templateFile, logoFile, backgroundFile] = await Promise.all([
    fsPromises.readFile(path.join(filePath, templateName), 'utf-8'),
    fsPromises.readFile(path.join(filePath, 'logo.mustache'), 'utf-8'),
    fsPromises.readFile(path.join(filePath, 'background.mustache'), 'utf-8'),
  ])

  const logo = mustache.render(logoFile, {})
  const background = mustache.render(backgroundFile, {})

  const template = mustache.render(
    templateFile,
    templateData,
    { logo, background },
  )

  return template
}

export default renderTemplate
