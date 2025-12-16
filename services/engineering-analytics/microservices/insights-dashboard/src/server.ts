/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (dashboardsApi - lines 215-222)
 *   - web/app/src/pages/dashboards/CustomDashboardsPage.tsx
 */
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

const PORT = process.env.PORT || 8033;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'insights-dashboard',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', (req, res) => {
    res.json({
      status: 'READY',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/live', (req, res) => {
    res.json({
      status: 'ALIVE',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization,
      }),
    })
  );

  httpServer.listen(PORT, () => {
    console.log(`🚀 Insights Dashboard server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
