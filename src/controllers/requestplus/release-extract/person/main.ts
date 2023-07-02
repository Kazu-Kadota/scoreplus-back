import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'
import { UserKey } from 'src/models/dynamo/user'
import { Controller, Request } from 'src/models/lambda'
import getUser from 'src/services/aws/dynamo/user/user/get'

import getCompanyAdapter from './get-company-adapter'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import validatePersonReleaseExtract from './validate'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const releaseExtractController: Controller = async (req: Request) => {
  const body = validatePersonReleaseExtract(JSON.parse(req.body as string))

  const user_key: UserKey = {
    user_id: req.user_info?.user_id as string,
  }

  const user = await getUser(user_key, dynamodbClient)

  const company = await getCompanyAdapter(req.user_info?.company_name as string, dynamodbClient)

  const person_analysis = getFinishedPersonAnalysisAdapter(body, dynamodbClient)

  const person_data = {
    company,
    user,
    person_analysis,
  }

  const file_path = path.join(__dirname, '..', '..', '..', '..', 'templates', 'requestplus', 'person_release_extract.mustache')

  const template = await fsPromises.readFile(file_path, 'utf-8')

  const body_html = mustache.render(template.toString(), person_data)

  return {
    headers: {
      'Content-Type': 'text/html',
    },
    body: body_html,
  }
}

export default releaseExtractController
