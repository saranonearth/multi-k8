docker build -t saranonearth/react-client:latest -t saranonearth/react-client:$SHA -f ./client/Dockerfile ./client
docker build -t saranonearth/server-exp:latest -t saranonearth/server-exp:$SHA -f ./server/Dockerfile ./server
docker build -t saranonearth/worker:latest -t saranonearth/worker:$SHA -f ./worker/Dockerfile ./worker


docker push saranonearth/react-client:latest
docker push saranonearth/server-exp:latest
docker push saranonearth/worker:latest

docker push saranonearth/react-client:$SHA
docker push saranonearth/server-exp:$SHA
docker push saranonearth/worker:$SHA

kubectl apply -f kubernetes

kubectl set image deployments/server-deployment server=saranonearth/server-exp:$SHA
kubectl set image deployments/client-deployment client=saranonearth/react-client:$SHA
kubectl set image deployments/worker-deployment worker=saranonearth/worker:$SHA