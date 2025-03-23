deploy:
	cd importService && cdk destroy --force
	cd authorizationService && npm run deploy
	cd importService && cdk deploy --require-approval never
