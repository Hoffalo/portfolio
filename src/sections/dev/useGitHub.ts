import { GITHUB_USERNAME } from "../../content/profile";
import { fetchContributions, fetchRepos } from "../../services/github";
import { useAsync } from "../../shared/useAsync";

export const useGitHubRepos = () =>
  useAsync(`repos:${GITHUB_USERNAME}`, () => fetchRepos(GITHUB_USERNAME));

export const useContributions = () =>
  useAsync(`contributions:${GITHUB_USERNAME}`, () => fetchContributions(GITHUB_USERNAME));
