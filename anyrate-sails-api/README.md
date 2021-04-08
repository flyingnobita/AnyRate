# AnyRate Rest API Server

https://anyrate-sails-api.herokuapp.com

## Deploy to Heroku

```shell
git push heroku main
```

## View Heroku Logs

```shell
heroku logs --tail
```

## Run Database

```shell
sails lift
```

## Add Data

```shell
sails console

Movie.create({name: 'Movie 1'}).exec(console.log)
Movie.create({name: 'Movie 2'}).exec(console.log)
User.create({name: 'Alice', usage: 1}).exec(console.log)
User.create({name: 'Bob', usage: [1, 2]}).exec(console.log)
```
