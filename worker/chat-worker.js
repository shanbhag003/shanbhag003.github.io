/* The portfolio assistant's Worker (classifier + knowledge base) is maintained
 * privately in the Cloudflare dashboard, NOT in this public repository.
 *
 * Why: the knowledge base holds richer professional detail than the website
 * shows, and should not be publicly browsable. Keeping it only in the deployed
 * Worker (whose source Cloudflare does not serve) keeps it private. The browser
 * sends a question to the Worker and receives a single curated answer; chat.js
 * never downloads a knowledge-base file.
 *
 * Deployed Worker: portfolio-chat.kshanbhag231.workers.dev
 * To edit the KB or logic, edit that Worker in the Cloudflare dashboard.
 */
