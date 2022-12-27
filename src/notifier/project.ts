import { SseNotifier } from "./notifier";

export class Project {
  private static projects: Record<string, Project> = {};

  private sessions: Record<string, SseNotifier> = {};

  private constructor(
    private id: string,
    private authUrl?: string
  ) {}

  static register(id: string, authUrl?: string): boolean {
    if (this.projects[id]) {
      return false;
    }
    this.projects[id] = new this(id, authUrl);
    return true;
  }

  static get(id: string): Project | undefined {
    return this.projects[id];
  }

  getId(): string {
    return this.id;
  }

  registerSession(id: string): boolean {
    if (this.sessions[id]) {
      return false;
    }
    this.sessions[id] = new SseNotifier(!this.authUrl);

    if (this.authUrl) {
      this.sessions[id].notify({
        event: "auth",
        data: {
          session: id,
          url: this.authUrl
        }
      });
    }
    return true;
  }

  getSession(id: string): SseNotifier | undefined {
    return this.sessions[id];
  }

  authorize(id: string): boolean {
    const session = this.getSession(id);

    if (session) {
      session.setAuth(true);
      return true;
    }
    return false;
  }
}
