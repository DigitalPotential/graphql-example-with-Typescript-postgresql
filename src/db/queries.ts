import { Pool } from "pg";

type Game = {
  id: number;
  title: string;
  platform: string[];
};

type Author = {
  id: number;
  name: string;
  verified: boolean;
};

type Review = {
  id: number;
  content: string;
  rating: number;
  game_id: number;
  author_id: number;
};

// type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = (
//   parent: TParent,
//   args: TArgs,
//   context: TContext,
//   info: GraphQLResolveInfo
// ) => Promise<TResult>;

const createResolvers = (pool: Pool) => ({
  Query: {
    games: async (): Promise<Game[]> => {
      try {
        const result = await pool.query("SELECT * FROM games");
        console.log("Query result:", result.rows);
        return result.rows;
      } catch (error) {
        console.error("Error in games resolver:", error);
        throw error;
      }
    },
    game: async ({}, args: { id: number }): Promise<Game | null> => {
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [
        args.id,
      ]);
      return result.rows[0] || null;
    },
    authors: async (): Promise<Author[]> => {
      const result = await pool.query("SELECT * FROM authors");
      return result.rows;
    },
    author: async (_: any, args: { id: number }): Promise<Author | null> => {
      const result = await pool.query("SELECT * FROM authors WHERE id = $1", [
        args.id,
      ]);
      return result.rows[0] || null;
    },
    reviews: async (): Promise<Review[]> => {
      const result = await pool.query("SELECT * FROM reviews");
      return result.rows;
    },
    review: async (_: any, args: { id: number }): Promise<Review | null> => {
      const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [
        args.id,
      ]);
      return result.rows[0] || null;
    },
  },
  Game: {
    reviews: async (parent: Game): Promise<Review[]> => {
      const result = await pool.query(
        "SELECT * FROM reviews WHERE game_id = $1",
        [parent.id]
      );
      return result.rows;
    },
  },
  Review: {
    author: async (parent: Review): Promise<Author | null> => {
      const result = await pool.query("SELECT * FROM authors WHERE id = $1", [
        parent.author_id,
      ]);
      return result.rows[0] || null;
    },
    game: async (parent: Review): Promise<Game | null> => {
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [
        parent.game_id,
      ]);
      return result.rows[0] || null;
    },
  },
  Author: {
    reviews: async (parent: Author): Promise<Review[]> => {
      const result = await pool.query(
        "SELECT * FROM reviews WHERE author_id = $1",
        [parent.id]
      );
      return result.rows;
    },
  },
  Mutation: {
    addGame: async (
      _: any,
      args: { game: { title: string; platform: string[] } }
    ): Promise<Game> => {
      const { title, platform } = args.game;
      const result = await pool.query(
        "INSERT INTO games(title, platform) VALUES($1, $2) RETURNING *",
        [title, platform]
      );
      return result.rows[0];
    },
    deleteGame: async (_: any, args: { id: number }): Promise<Game[]> => {
      await pool.query("DELETE FROM games WHERE id = $1", [args.id]);
      const result = await pool.query("SELECT * FROM games");
      return result.rows;
    },
    updateGame: async (
      _: any,
      args: { id: number; edits: Partial<Game> }
    ): Promise<Game | null> => {
      const { id, edits } = args;
      const { title, platform } = edits;

      const result = await pool.query(
        `UPDATE games SET title = COALESCE($1, title), platform = COALESCE($2, platform) WHERE id = $3 RETURNING *`,
        [title, platform, id]
      );

      return result.rows[0] || null;
    },
  },
});

export default createResolvers;

// import { Pool } from 'pg';
// import { GraphQLResolveInfo } from 'graphql';

// type Game = {
//   id: number;
//   title: string;
//   platform: string[];
// };

// type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = (
//   parent: TParent,
//   args: TArgs,
//   context: TContext,
//   info: GraphQLResolveInfo
// ) => Promise<TResult> | TResult;

// type QueryResolvers = {
//   games: Resolver<Game[], {}, { pool: Pool }>;
// };

// const createResolvers = (pool: Pool) => ({
//   Query: {
//     games: async (_parent, _args, { pool }, _info): Promise<Game[]> => {
//       try {
//         const result = await pool.query("SELECT * FROM games");
//         console.log("Query result:", result.rows);
//         return result.rows;
//       } catch (error) {
//         console.error("Error in games resolver:", error);
//         throw error;
//       }
//     },
//   } as QueryResolvers,
// });

// export default createResolvers;
