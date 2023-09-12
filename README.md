# prac-express-aws


```bash
aws dynamodb create-table --cli-input-json file://dynamodb/create_user_table_local.json --endpoint-url  http://localhost:8000

aws dynamodb batch-write-item --request-items file://dynamodb/users_data.json  --endpoint-url http://localhost:8000
```

to delete table

```bash
aws dynamodb delete-table --table-name Users --endpoint-url http://localhost:8000
```

