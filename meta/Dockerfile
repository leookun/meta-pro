# 构建阶段
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 复制 go.mod 和 go.sum (如果存在)
COPY go.* ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -o main main.go

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 从构建阶段复制编译好的程序
COPY --from=builder /app/main .

# 运行程序
CMD ["./main", "-f", "/config/config.yaml", "-d", "/config/"]
