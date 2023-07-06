import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'

const renderTemplate = async <Data>(templateName: string, templateData: Data) => {
  const filePath = path.join(__dirname, '..', '..', '..', 'templates', 'requestplus')

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
